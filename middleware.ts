import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import router from "@/routes";
import {
    apiAuthPrefix,
    authRoutes,
    DEFAULT_ERROR_REDIRECT,
    DEFAULT_REDIRECT,
    publicPaths,
} from "@/routes/protectedAuth";

export async function middleware(req: NextRequest) {
    const { nextUrl: url } = req;
    const isLoggedIn = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    const isApiAuthRoute = url.pathname.startsWith(apiAuthPrefix);
    const isPublicRoute = publicPaths.some((path) => url.pathname.startsWith(path));
    const isAuthRoute = authRoutes.includes(url.pathname);

    if (isApiAuthRoute) {
        return NextResponse.next();
    }

    if (isLoggedIn) {
        if (isAuthRoute || url.pathname === router.home.p) {
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

// Next.js requires the matcher to be hardcoded here for static analysis
export const config = {
    matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
