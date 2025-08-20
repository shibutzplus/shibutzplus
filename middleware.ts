import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import router from "@/routes";
import {
    apiAuthPrefix,
    DEFAULT_ERROR_REDIRECT,
    DEFAULT_REDIRECT,
    protectedPaths,
    publicPaths,
} from "@/routes/protectedAuth";

export async function middleware(req: NextRequest) {
    const { nextUrl: url } = req;
    const isLoggedIn = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    const isApiAuthRoute = url.pathname.startsWith(apiAuthPrefix);
    const isPublicRoute = publicPaths.some((path) => url.pathname.startsWith(path));
    const isProtectedRoute = protectedPaths.some((path) => url.pathname.startsWith(path));

    if (isApiAuthRoute) {
        return NextResponse.next();
    }

    if (url.pathname === router.home.p) {
        url.pathname = DEFAULT_ERROR_REDIRECT;
        return NextResponse.redirect(url);
    }

    if (isProtectedRoute) {
        if (isLoggedIn) {
            url.pathname = DEFAULT_REDIRECT;
            return NextResponse.redirect(url);
        }
    }

    if (!isLoggedIn && !isPublicRoute) {
        url.pathname = DEFAULT_ERROR_REDIRECT;
        return NextResponse.redirect(url);
    }

    return NextResponse.next();
}

// Next.js requires the matcher to be hardcoded here for static analysis
export const config = {
    matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
