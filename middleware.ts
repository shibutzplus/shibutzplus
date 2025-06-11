import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import router from "@/routes";
import { protectedPaths, publicPaths, configMatcher } from "@/routes/protectedAuth";

export async function middleware(req: NextRequest) {
    const { nextUrl: url } = req;
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (url.pathname === router.home.p) {
        url.pathname = router.login.p;
        return NextResponse.redirect(url);
    }

    if (protectedPaths.some((path) => url.pathname.startsWith(path))) {
        if (!token) {
            url.pathname = router.login.p;
            return NextResponse.redirect(url);
        }
    }

    if (publicPaths.some((path) => url.pathname.startsWith(path))) {
        if (token) {
            url.pathname = router.dashboard.p;
            return NextResponse.redirect(url);
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: configMatcher,
};
