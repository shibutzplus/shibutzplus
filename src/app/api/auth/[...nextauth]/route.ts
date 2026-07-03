import "server-only";
import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = 'force-dynamic';
export const runtime = 'edge';

const isBuildTime = process.env.NEXT_PHASE === 'phase-production-build' || !process.env.NEXTAUTH_SECRET;
const authHandler = (!isBuildTime ? NextAuth(authOptions) : null) as any;
const buildFallback = () => new Response(JSON.stringify({ status: "build_ok" }), { status: 200 });

export async function GET(request: Request, ctx: any) {
    if (isBuildTime || !authHandler) {
        return buildFallback();
    }
    return authHandler(request, ctx);
}

export async function POST(request: Request, ctx: any) {
    if (isBuildTime || !authHandler) {
        return buildFallback();
    }
    return authHandler(request, ctx);
}