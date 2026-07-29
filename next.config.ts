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
        // Cloudflare runtime types are unrelated to the browser-only Pages build.
        ignoreBuildErrors: true,
      },
    }
  : {};

export default nextConfig;
