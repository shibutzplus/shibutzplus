import { NextResponse } from "next/server";
import { USER_ROLES } from "@/models/constant/auth";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import router from "@/routes";
import { apiAuthPrefix, authRoutes, DEFAULT_REDIRECT, GUEST_REDIRECT, GUEST_UNAUTHORIZED, protectedPaths } from "@/routes/protectedAuth";

export async function middleware(req: NextRequest) {
    const { nextUrl: url } = req;

    // Skip NextAuth and public API routes (manifest for PWA, sync polling, cron jobs)
    const publicApiRoutes = [apiAuthPrefix, "/api/manifest", "/api/sync/poll", "/api/cron"];

    if (url.pathname.startsWith("/api/manifest")) {
        console.log("Middleware: TRACE - /api/manifest request detected", url.pathname);
    }

    const isPublicApiRoute = publicApiRoutes.some((route) => url.pathname.startsWith(route));
    if (isPublicApiRoute) {
        if (url.pathname.startsWith("/api/manifest")) {
            console.log("Middleware: TRACE - Allowing /api/manifest as public API route");
        }
        return NextResponse.next();
    }

    // Check if the path is in the list of protected paths
    const isProtected = protectedPaths.some(
        (path: string) => url.pathname === path || url.pathname.startsWith(`${path}/`),
    );

    // Check if this is a protected API route (any /api/* route not in publicApiRoutes)
    const isProtectedApi = url.pathname.startsWith("/api/");

    // Only fetch token when we actually need to check authentication:
    // 1. Protected routes (obviously)
    // 2. Auth routes or Home page (to redirect logged-in users away)
    // 3. Protected API routes
    const isAuthRoute = authRoutes.includes(url.pathname);
    const isHomePage = url.pathname === router.home.p;
    const needsAuthCheck = isProtected || isAuthRoute || isHomePage || isProtectedApi;

    if (!needsAuthCheck) {
        return NextResponse.next();
    }

    const isLoggedIn = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (isLoggedIn) {
        // Normalize role from token (can be at root or under user property)
        const role = (isLoggedIn as any)?.role ?? (isLoggedIn as any)?.user?.role;

        // If logged in and on home or auth route (sign-in), redirect to dashboard
        if (isAuthRoute || isHomePage) {
            if (role === USER_ROLES.ADMIN) {
                url.pathname = router.schoolSelect.p;
            } else {
                url.pathname = DEFAULT_REDIRECT;
            }
            return NextResponse.redirect(url);
        }

        // Guest logic
        if (
            GUEST_UNAUTHORIZED.some((route: string) => url.pathname.startsWith(route)) &&
            role === USER_ROLES.GUEST
        ) {
            url.pathname = GUEST_REDIRECT;
            return NextResponse.redirect(url);
        }

        return NextResponse.next();
    }

    // Not Logged In
    // For API routes, return 401 instead of redirect
    if (isProtectedApi) {
        return NextResponse.json(
            { error: "Unauthorized", message: "Authentication required" },
            { status: 401 }
        );
    }

    // If accessing protected route, redirect to home/signin
    if (isProtected) {
        let callbackUrl = url.pathname;
        if (url.search) {
            callbackUrl += url.search;
        }

        const encodedCallbackUrl = encodeURIComponent(callbackUrl);

        url.pathname = "/";
        url.search = `?callbackUrl=${encodedCallbackUrl}`;

        return NextResponse.redirect(url);
    }

    // Allow public routes (Home, etc)
    return NextResponse.next();
}

export const config = {
    // Match all requests except:
    // - Next.js internals (_next/static, _next/image)
    // - Static files (images, CSS, JS, etc.)
    matcher: [
        "/((?!_next/static|_next/image|favicon.ico|api/manifest|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|woff|woff2|ttf|eot|webmanifest|json)).*)",
    ],
};
