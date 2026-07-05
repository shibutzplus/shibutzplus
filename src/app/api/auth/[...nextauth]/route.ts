import "./env-guard";
import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// During Next.js production build phase, return a stub response to skip
// running NextAuth (which requires Node.js APIs unavailable in Edge at build time).
const isBuildTime = process.env.NEXT_PHASE === 'phase-production-build';

const buildFallback = () =>
    new Response(JSON.stringify({ status: "build_ok" }), { status: 200 });

export async function GET(request: Request, ctx: any) {
    if (isBuildTime) return buildFallback();
    return NextAuth(authOptions)(request, ctx);
}

export async function POST(request: Request, ctx: any) {
    if (isBuildTime) return buildFallback();
    return NextAuth(authOptions)(request, ctx);
}