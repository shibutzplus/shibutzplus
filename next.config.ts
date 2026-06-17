import type { NextConfig } from "next";

const CSP_HEADER = `
    default-src 'self';
    script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.clarity.ms https://*.clarity.ms https://va.vercel-scripts.com;
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    img-src 'self' blob: data: https://*.googleusercontent.com https://*.auth0.com https://*.r2.cloudflarestorage.com;
    font-src 'self' https://fonts.gstatic.com;
    connect-src 'self' https://*.clarity.ms https://c.bing.com https://*.vercel-insights.com https://*.upstash.io https://*.r2.cloudflarestorage.com https://*.google-analytics.com https://*.auth0.com;
    frame-src 'self' https://*.auth0.com;
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    block-all-mixed-content;
    upgrade-insecure-requests;
`.replace(/\s{2,}/g, " ").trim();

const nextConfig: NextConfig = {
    typescript: {
        ignoreBuildErrors: true,
    },
    eslint: {
        ignoreDuringBuilds: true,
    },
    async headers() {
        return [
            {
                source: "/(.*)",
                headers: [
                    {
                        key: "Content-Security-Policy",
                        value: CSP_HEADER,
                    },
                    {
                        key: "Strict-Transport-Security",
                        value: "max-age=31536000; includeSubDomains; preload",
                    },
                    {
                        key: "X-Frame-Options",
                        value: "DENY",
                    },
                    {
                        key: "X-Content-Type-Options",
                        value: "nosniff",
                    },
                    {
                        key: "Referrer-Policy",
                        value: "strict-origin-when-cross-origin",
                    },
                    {
                        key: "Cross-Origin-Opener-Policy",
                        value: "same-origin-allow-popups",
                    },
                ],
            },
        ];
    },
};

export default nextConfig;
