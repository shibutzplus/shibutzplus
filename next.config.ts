import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    typescript: {
        ignoreBuildErrors: true,
    },
    eslint: {
        ignoreDuringBuilds: true,
    },
    webpack: (config, { isServer }) => {
        if (!isServer) {
            if (!config.resolve) {
                config.resolve = {};
            }
            config.resolve.fallback = {
                ...config.resolve.fallback,
                crypto: false,
            };
        }
        return config;
    },
};

export default nextConfig;
