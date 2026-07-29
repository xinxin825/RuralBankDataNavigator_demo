import type { NextConfig } from "next";

const isGitHubPages = process.env.GITHUB_PAGES === "true";
const repositoryBasePath = "/RuralBankDataNavigator_demo";

const nextConfig: NextConfig = isGitHubPages
  ? {
      output: "export",
      trailingSlash: true,
      basePath: repositoryBasePath,
      assetPrefix: repositoryBasePath,
      images: {
        unoptimized: true,
      },
      typescript: {
        // The Cloudflare worker has runtime-only types that are unrelated to
        // the browser-only GitHub Pages export.
        ignoreBuildErrors: true,
      },
    }
  : {};

export default nextConfig;