import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    typescript: {
        ignoreBuildErrors: true,
    },
    eslint: {
        ignoreDuringBuilds: true,
    },
    productionBrowserSourceMaps: false,
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

