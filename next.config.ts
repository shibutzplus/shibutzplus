import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    typescript: {
        ignoreBuildErrors: true,
    },
    eslint: {
        ignoreDuringBuilds: true,
    },
    productionBrowserSourceMaps: false,
    // Keep the deployment version into the client so it can detect
    // when a new build is deployed and auto-reload on errors.
    env: {
        NEXT_PUBLIC_BUILD_ID: process.env.CF_PAGES_COMMIT_SHA,
    },
    experimental: {
        optimizePackageImports: [
            "recharts",
            "motion",
            "@tiptap/react",
            "@tiptap/starter-kit",
            "@react-pdf/renderer",
            "xlsx",
        ],
    },
    webpack: (config) => {
        config.module = config.module || {};
        config.module.exprContextCritical = false;
        return config;
    },
};

export default nextConfig;


