import "./env-guard";
import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// During Next.js production build phase, return a stub response to skip
// running NextAuth (which requires Node.js APIs unavailable in Edge at build time).
const isBuildTime = process.env.NEXT_PHASE === 'phase-production-build';

const buildFallback = () =>
    new Response(JSON.stringify({ status: "build_ok" }), { status: 200 });

const handler = NextAuth(authOptions);

export async function GET(request: Request, ctx: any) {
    if (isBuildTime) return buildFallback();
    try {
        return await handler(request, ctx);
    } catch (error: any) {
        console.error("CRITICAL AUTH GET ERROR:", error);
        return new NextResponse(
            JSON.stringify({ error: error?.message || String(error), stack: error?.stack || "No stack trace" }), 
            { status: 500, headers: { "content-type": "application/json" } }
        );
    }
}

export async function POST(request: Request, ctx: any) {
    if (isBuildTime) return buildFallback();
    try {
        return await handler(request, ctx);
    } catch (error: any) {
        console.error("CRITICAL AUTH POST ERROR:", error);
        return new NextResponse(
            JSON.stringify({ error: error?.message || String(error), stack: error?.stack || "No stack trace" }), 
            { status: 500, headers: { "content-type": "application/json" } }
        );
    }
}