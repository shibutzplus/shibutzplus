import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    typescript: {
        ignoreBuildErrors: true,
    },
    eslint: {
        ignoreDuringBuilds: true,
    },
    webpack: (config, { isServer }) => {
        if (isServer) {
            config.resolve.fallback = {
                ...config.resolve.fallback,
                crypto: require.resolve("crypto-browserify"),
                stream: false,
                util: false,
                http: false,
                https: false,
                net: false,
                tls: false,
                zlib: false,
            };
        }
        return config;
    },
};

export default nextConfig;
