import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import router from "@/routes";
import {
    apiAuthPrefix,
    authRoutes,
    DEFAULT_ERROR_REDIRECT,
    DEFAULT_REDIRECT,
    GUEST_REDIRECT,
    GUEST_UNAUTHORIZED,
    publicPaths,
    ADMIN_ROUTES,
} from "@/routes/protectedAuth";

export async function middleware(req: NextRequest) {
    const { nextUrl: url } = req;
    console.log("Middleware starting for path:", url.pathname);
    const isLoggedIn = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    const isApiAuthRoute = url.pathname.startsWith(apiAuthPrefix);
    const isPublicRoute = publicPaths.some((path) => url.pathname.startsWith(path));
    const isAuthRoute = authRoutes.includes(url.pathname);

    if (isApiAuthRoute) {
        return NextResponse.next();
    }

    if (isLoggedIn) {
        if (isAuthRoute || url.pathname === router.home.p) {
            if (isLoggedIn.role === "admin" || (isLoggedIn as any).user?.role === "admin") {
                url.pathname = router.schoolSelect.p;
            } else {
                url.pathname = DEFAULT_REDIRECT;
            }
            return NextResponse.redirect(url);
        }

        if (
            GUEST_UNAUTHORIZED.some((route) => url.pathname.startsWith(route)) &&
            (isLoggedIn.role === "guest" || (isLoggedIn as any).user?.role === "guest")
        ) {
            url.pathname = GUEST_REDIRECT;
            return NextResponse.redirect(url);
        }

        if (
            ADMIN_ROUTES.some((route) => url.pathname.startsWith(route)) &&
            (isLoggedIn.role !== "admin" && (isLoggedIn as any).user?.role !== "admin")
        ) {
            url.pathname = DEFAULT_REDIRECT;
            return NextResponse.redirect(url);
        }

        return NextResponse.next();
    }

    if (!isLoggedIn && !isPublicRoute) {
        let callbackUrl = url.pathname;
        if (url.search) {
            callbackUrl += url.search;
        }

        const encodedCallbackUrl = encodeURIComponent(callbackUrl);
        url.pathname = DEFAULT_ERROR_REDIRECT;
        url.search = `?callbackUrl=${encodedCallbackUrl}`;

        return NextResponse.redirect(url);
    }

    if (url.pathname === router.home.p) {
        url.pathname = DEFAULT_ERROR_REDIRECT;
        return NextResponse.redirect(url);
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
