#!/usr/bin/env bash
# Pulls the latest code, rebuilds the images, runs pending migrations, and
# redeploys — for an already-installed server (see deploy.sh for the first
# install). Safe to re-run any time there's a new commit to ship.
#
# Usage, on the server, from inside the cloned repo:
#   ./update.sh                # pulls the current branch's upstream
#   ./update.sh main           # pulls a specific branch
#
# Won't touch .env, and never redeploys app/worker if the migration step
# fails — the old containers just keep running on the old image.
set -euo pipefail

BRANCH="${1:-}"

log()  { printf '\n\033[1;36m==>\033[0m %s\n' "$1"; }
warn() { printf '\033[1;33m!!\033[0m %s\n' "$1"; }
die()  { printf '\033[1;31mERROR:\033[0m %s\n' "$1" >&2; exit 1; }

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

[ -f "docker-compose.yml" ] && [ -f "Dockerfile" ] || die "Run this from inside the cloned project directory (docker-compose.yml/Dockerfile not found here)."
[ -f ".env" ] || die "No .env found — this looks like a fresh server. Run ./deploy.sh instead."
command -v git >/dev/null 2>&1 || die "git is not installed."

SUDO=""
if [ "$(id -u)" -ne 0 ]; then SUDO="sudo"; fi
DC="$SUDO docker compose"

# ---------------------------------------------------------------------------
# 1. Pull the latest code. Fast-forward only — if local commits or edits
#    exist, this stops rather than silently merging/discarding anything on
#    the server.
# ---------------------------------------------------------------------------
if [ -n "$(git status --porcelain)" ]; then
  die "Uncommitted changes in $(pwd) — commit, stash, or discard them before updating."
fi

log "Fetching latest code."
git fetch --all --prune
if [ -n "$BRANCH" ]; then
  git checkout "$BRANCH"
fi
CURRENT_BRANCH="$(git rev-parse --abbrev-ref HEAD)"
BEFORE_SHA="$(git rev-parse HEAD)"
git pull --ff-only origin "$CURRENT_BRANCH"
AFTER_SHA="$(git rev-parse HEAD)"

if [ "$BEFORE_SHA" = "$AFTER_SHA" ]; then
  log "Already up to date (${CURRENT_BRANCH} @ ${AFTER_SHA:0:7}) — rebuilding anyway in case local images are stale."
else
  log "Updated ${CURRENT_BRANCH}: ${BEFORE_SHA:0:7} -> ${AFTER_SHA:0:7}"
fi

# ---------------------------------------------------------------------------
# 2. Rebuild images with the new code.
# ---------------------------------------------------------------------------
log "Building images."
$DC build

# ---------------------------------------------------------------------------
# 3. Run pending migrations BEFORE touching app/worker — `migrate` is a
#    one-shot container (restart: "no"); recreating it re-runs
#    `prisma migrate deploy && npm run db:seed` against the new image.
#    If this fails, stop here — the old app/worker containers keep serving
#    traffic on the old (still-migrated-compatible) schema instead of being
#    redeployed onto a half-migrated database.
# ---------------------------------------------------------------------------
log "Running database migrations."
if ! $DC up -d --force-recreate migrate; then
  die "Failed to start the migrate container — check: docker compose logs migrate"
fi

for _ in $(seq 1 60); do
  state="$($DC ps --format '{{.State}}' migrate 2>/dev/null || true)"
  [ "$state" = "exited" ] && break
  sleep 3
done

exit_code="$($DC ps -a --format '{{.ExitCode}}' migrate 2>/dev/null | head -n1 || true)"
if [ "$exit_code" != "0" ]; then
  warn "Migrations did not finish cleanly (exit code: ${exit_code:-unknown}) — check: docker compose logs migrate"
  die "Stopping before redeploying app/worker. Fix the migration, then re-run ./update.sh."
fi
log "Migrations applied."

# ---------------------------------------------------------------------------
# 4. Redeploy app, worker, and caddy (postgres/redis are left alone — they
#    don't rebuild from this repo's Dockerfile).
# ---------------------------------------------------------------------------
log "Redeploying app, worker, caddy."
$DC up -d app worker caddy

log "Waiting for the app to answer..."
APP_UP=""
for _ in $(seq 1 40); do
  if $DC exec -T app node -e "require('http').get('http://127.0.0.1:3000/',r=>process.exit(r.statusCode<500?0:1)).on('error',()=>process.exit(1))" >/dev/null 2>&1; then
    APP_UP=1
    break
  fi
  sleep 3
done

echo
log "Done."
echo "  Status: ${SUDO:+sudo }docker compose ps"
echo "  Logs:   ${SUDO:+sudo }docker compose logs -f app worker"
if [ -z "$APP_UP" ]; then
  warn "The app didn't answer within the wait window — it may still be starting. Check: docker compose logs app"
fi
