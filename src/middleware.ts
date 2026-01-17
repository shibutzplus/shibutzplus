import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import router from "@/routes";
import {
    apiAuthPrefix,
    authRoutes,
    DEFAULT_REDIRECT,
    GUEST_REDIRECT,
    GUEST_UNAUTHORIZED,
    ADMIN_ROUTES,
    protectedPaths,
} from "@/routes/protectedAuth";

export async function middleware(req: NextRequest) {
    const { nextUrl: url } = req;
    const isLoggedIn = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    const isApiAuthRoute = url.pathname.startsWith(apiAuthPrefix);
    const isAuthRoute = authRoutes.includes(url.pathname);
    const isHomePage = url.pathname === router.home.p;

    // Check if the path is in the list of protected paths
    const isProtected = protectedPaths.some(
        (path: string) => url.pathname === path || url.pathname.startsWith(`${path}/`),
    );

    if (isApiAuthRoute) {
        return NextResponse.next();
    }

    if (isLoggedIn) {
        // If logged in and on home or auth route (sign-in), redirect to dashboard
        if (isAuthRoute || isHomePage) {
            if (isLoggedIn.role === "admin" || (isLoggedIn as any).user?.role === "admin") {
                url.pathname = router.schoolSelect.p;
            } else {
                url.pathname = DEFAULT_REDIRECT;
            }
            return NextResponse.redirect(url);
        }

        // Guest logic
        if (
            GUEST_UNAUTHORIZED.some((route: string) => url.pathname.startsWith(route)) &&
            (isLoggedIn.role === "guest" || (isLoggedIn as any).user?.role === "guest")
        ) {
            url.pathname = GUEST_REDIRECT;
            return NextResponse.redirect(url);
        }

        return NextResponse.next();
    }

    // Not Logged In
    // If accessing protected route, redirect to home/signin
    if (isProtected) {
        let callbackUrl = url.pathname;
        if (url.search) {
            callbackUrl += url.search;
        }

        const encodedCallbackUrl = encodeURIComponent(callbackUrl);
        // Redirect to landing page but with callback if we want to support redirect back after login
        // Since we are changing login to be on the landing page, we can assume callbackUrl query param is handled there or by next-auth

        url.pathname = "/";
        url.search = `?callbackUrl=${encodedCallbackUrl}`;

        return NextResponse.redirect(url);
    }

    // Allow public routes (Home, etc)
    return NextResponse.next();
}

export const config = {
    matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
