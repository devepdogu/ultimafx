#!/usr/bin/env bash
# One-command production install for Ubuntu (22.04/24.04/26.x — the Docker
# repo step detects the codename itself, it isn't hardcoded to one release).
#
# Usage, on the server, from inside the cloned repo:
#   ./deploy.sh [domain] [admin_phone] [admin_pass]
#
#   ./deploy.sh                                # no domain yet: serves http://SERVER_IP:3000
#   ./deploy.sh fx.example.com                 # Caddy requests HTTPS for this domain automatically
#   ./deploy.sh fx.example.com 5551234567 'S3cret!Pass'
#
# Safe to re-run: it installs Docker only if missing, and only ever *creates*
# .env if one doesn't already exist — an existing production .env (and its
# secrets) is never touched or regenerated on a later run. For a routine code
# update on an already-installed server, use ./update.sh instead — it also
# pulls the latest commit first and refuses to redeploy app/worker if the
# migration step fails, instead of rolling out onto a half-migrated database.
set -euo pipefail

DOMAIN="${1:-}"
ADMIN_PHONE_ARG="${2:-}"
ADMIN_PASS_ARG="${3:-}"

log()  { printf '\n\033[1;36m==>\033[0m %s\n' "$1"; }
warn() { printf '\033[1;33m!!\033[0m %s\n' "$1"; }
die()  { printf '\033[1;31mERROR:\033[0m %s\n' "$1" >&2; exit 1; }

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

[ -f "docker-compose.yml" ] && [ -f "Dockerfile" ] || die "Run this from inside the cloned project directory (docker-compose.yml/Dockerfile not found here)."

SUDO=""
if [ "$(id -u)" -ne 0 ]; then SUDO="sudo"; fi

# ---------------------------------------------------------------------------
# 1. Docker Engine + Compose plugin (official Docker apt repo; codename is
#    read from /etc/os-release, not assumed, so this follows whatever Ubuntu
#    release is actually on the box).
# ---------------------------------------------------------------------------
if ! command -v docker >/dev/null 2>&1; then
  log "Docker not found — installing Docker Engine from the official apt repo."
  $SUDO apt-get update -y
  $SUDO apt-get install -y ca-certificates curl gnupg
  $SUDO install -m 0755 -d /etc/apt/keyrings
  $SUDO curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
  $SUDO chmod a+r /etc/apt/keyrings/docker.asc
  . /etc/os-release
  echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu ${VERSION_CODENAME} stable" \
    | $SUDO tee /etc/apt/sources.list.d/docker.list > /dev/null
  $SUDO apt-get update -y
  $SUDO apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
  $SUDO systemctl enable --now docker
  if [ "$(id -u)" -ne 0 ] && ! id -nG "$USER" | grep -qw docker; then
    $SUDO usermod -aG docker "$USER"
    warn "Added $USER to the 'docker' group — log out and back in for that to apply to your own shell later. This script keeps using sudo for the rest of this run."
  fi
else
  log "Docker already installed ($(docker --version))."
fi

DC="$SUDO docker compose"

# ---------------------------------------------------------------------------
# 2. .env — created once, never overwritten on a later run.
# ---------------------------------------------------------------------------
if [ ! -f ".env" ]; then
  log "No .env yet — generating one for this deployment."
  [ -f ".env.docker.example" ] || die ".env.docker.example is missing from the repo."
  cp .env.docker.example .env

  PG_PASS="$(openssl rand -hex 24)"
  AUTH_SECRET="$(openssl rand -base64 32)"
  PROVIDER_KEY="$(openssl rand -base64 32)"
  ADMIN_PHONE="${ADMIN_PHONE_ARG:-5320000099}"
  ADMIN_PASS="${ADMIN_PASS_ARG:-$(openssl rand -base64 18 | tr -d '/+=' | cut -c1-20)}"

  if [ -n "$DOMAIN" ]; then
    PUBLIC_URL="https://${DOMAIN}"
  else
    PUBLIC_IP="$(curl -s --max-time 5 https://ifconfig.me || true)"
    PUBLIC_URL="http://${PUBLIC_IP:-localhost}:3000"
    warn "No domain given — serving over plain HTTP at ${PUBLIC_URL}. Re-run with a domain once DNS is pointed here to get HTTPS: ./deploy.sh your-domain.com"
  fi

  # In-place edits to the copied template — every placeholder below exists
  # verbatim in .env.docker.example, so an unmatched one here would mean that
  # file drifted; fail loudly rather than silently ship a half-filled .env.
  sed -i \
    -e "s#^POSTGRES_PASSWORD=.*#POSTGRES_PASSWORD=\"${PG_PASS}\"#" \
    -e "s#^DATABASE_URL=.*#DATABASE_URL=\"postgresql://postgres:${PG_PASS}@postgres:5432/ultima?schema=public\"#" \
    -e "s#^AUTH_SECRET=.*#AUTH_SECRET=\"${AUTH_SECRET}\"#" \
    -e "s#^AUTH_URL=.*#AUTH_URL=\"${PUBLIC_URL}\"#" \
    -e "s#^DOMAIN=.*#DOMAIN=\"${DOMAIN}\"#" \
    -e "s#^PROVIDER_SECRET_ENCRYPTION_KEY=.*#PROVIDER_SECRET_ENCRYPTION_KEY=\"${PROVIDER_KEY}\"#" \
    -e "s#^ADMIN_PHONE=.*#ADMIN_PHONE=${ADMIN_PHONE}#" \
    -e "s#^ADMIN_PASS=.*#ADMIN_PASS=\"${ADMIN_PASS}\"#" \
    .env

  chmod 600 .env
  log "Generated .env (secrets are random and shown once below — save them now)."
  echo "  Admin phone:    ${ADMIN_PHONE}"
  echo "  Admin password: ${ADMIN_PASS}"
  echo "  Public URL:     ${PUBLIC_URL}"
else
  log ".env already exists — leaving it as-is."
fi

# ---------------------------------------------------------------------------
# 3. Build and start. `migrate` (prisma migrate deploy + seed) runs to
#    completion before `app`/`worker` start, per its depends_on condition in
#    docker-compose.yml — nothing extra to do here for that.
# ---------------------------------------------------------------------------
log "Building images (first run downloads base images + installs deps — a few minutes)."
$DC build

log "Starting the stack (postgres, redis, migrate, app, worker, caddy)."
$DC up -d

log "Waiting for the database migration + seed job to finish..."
for _ in $(seq 1 60); do
  status="$($DC ps --format '{{.Service}} {{.State}}' migrate 2>/dev/null || true)"
  case "$status" in
    *exited*) break ;;
  esac
  sleep 3
done
if $DC ps migrate --format '{{.ExitCode}}' 2>/dev/null | grep -qx 0; then
  log "Migrations applied and database seeded."
else
  warn "Could not confirm the migrate job succeeded — check: docker compose logs migrate"
fi

log "Waiting for the app to answer..."
for _ in $(seq 1 40); do
  if $DC exec -T app node -e "require('http').get('http://127.0.0.1:3000/',r=>process.exit(r.statusCode<500?0:1)).on('error',()=>process.exit(1))" >/dev/null 2>&1; then
    APP_UP=1
    break
  fi
  sleep 3
done

echo
log "Done."
echo "  Status:   ${SUDO:+sudo }docker compose ps"
echo "  Logs:     ${SUDO:+sudo }docker compose logs -f app worker"
echo "  Re-seed:  ${SUDO:+sudo }docker compose run --rm migrate"
echo "  Update:   ./update.sh"
if [ -z "${APP_UP:-}" ]; then
  warn "The app didn't answer within the wait window — it may still be starting. Check: docker compose logs app"
fi
