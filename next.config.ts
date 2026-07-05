import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
    typescript: {
        ignoreBuildErrors: true,
    },
    eslint: {
        ignoreDuringBuilds: true,
    },
    webpack: (config, { webpack }) => {
        config.resolve = config.resolve || {};
        config.resolve.alias = {
            ...(config.resolve.alias || {}),
            "@": path.resolve(__dirname, "src"),
        };
        config.resolve.fallback = {
            ...(config.resolve.fallback || {}),
            fs: false,
            path: false,
            child_process: false,
            net: false,
            tls: false,
            crypto: false,
            http: false,
            https: false,
            stream: false,
            zlib: false,
            os: false,
            url: false,
            querystring: false,
            dns: false,
            readline: false,
            vm: false,
            "node:fs": false,
            "node:path": false,
            "node:child_process": false,
            "node:net": false,
            "node:tls": false,
            "node:crypto": false,
            "node:http": false,
            "node:https": false,
            "node:stream": false,
            "node:zlib": false,
            "node:os": false,
            "node:url": false,
            "node:querystring": false,
            "node:dns": false,
            "node:readline": false,
            "node:vm": false,
        };
        config.plugins = config.plugins || [];
        config.plugins.push(
            new webpack.NormalModuleReplacementPlugin(/^node:/, (resource: any) => {
                resource.request = resource.request.replace(/^node:/, "");
            })
        );
        return config;
    },
};

export default nextConfig;
