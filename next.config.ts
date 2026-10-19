import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  // Self-contained server bundle (.next/standalone) — what the Docker image runs,
  // so the production image doesn't need the full node_modules tree.
  output: "standalone",
};

export default withNextIntl(nextConfig);
