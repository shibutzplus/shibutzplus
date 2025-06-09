import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import router from "@/models/routes";

export async function middleware(req: NextRequest) {
    const { nextUrl: url } = req;
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    const protectedPaths = [router.dashboard];
    const publicPaths = [router.login, router.register, router.about];

    if (protectedPaths.some((path) => url.pathname.startsWith(path))) {
        if (!token) {
            url.pathname = router.login;
            return NextResponse.redirect(url);
        }
    }

    if (publicPaths.some((path) => url.pathname.startsWith(path))) {
        if (token) {
            url.pathname = router.dashboard;
            return NextResponse.redirect(url);
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [router.dashboard + "/:path*", router.login, router.register],
};
