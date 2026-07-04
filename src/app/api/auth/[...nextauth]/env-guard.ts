// Polyfills for NextAuth / openid-client in Edge Runtime (Cloudflare Pages production build).
// This file is only imported by route.ts — never by auth.ts or any other server file.

// 1. Polyfill process.env and environment variables
if (typeof process === "undefined") {
    (globalThis as any).process = { env: {} };
} else if (!process.env) {
    (process as any).env = {};
}

if (!process.env.NEXTAUTH_URL) {
    process.env.NEXTAUTH_URL = process.env.NEXT_PUBLIC_APP_URL || "https://shibutzplus.com";
}
if (!process.env.NEXTAUTH_SECRET) {
    process.env.NEXTAUTH_SECRET = "temporary_secret_for_build_purposes_only_1234567890";
}

// 2. Polyfill process.version — needed by readable-stream (used internally by next-auth).
//    The Edge Runtime provides a 'process' shim, but without 'version'.
if (!process.version) {
    (process as any).version = "v18.0.0";
}

// 3. Polyfill util.inspect.custom — needed by openid-client's [inspect.custom]() method.
//    The Edge Runtime provides a 'util' shim, but without inspect.custom.
import * as util from "util";
if (util) {
    const u = util as any;
    const inspectObj = u.inspect ?? (u.default?.inspect);
    if (inspectObj) {
        if (!inspectObj.custom) {
            inspectObj.custom = Symbol.for("nodejs.util.inspect.custom");
        }
    } else {
        const mockInspect = { custom: Symbol.for("nodejs.util.inspect.custom") };
        try { u.inspect = mockInspect; } catch (_) {}
        try { if (u.default) u.default.inspect = mockInspect; } catch (_) {}
    }
}
