import "server-only";

export const dynamic = 'force-dynamic';
export const runtime = 'edge';

// זיהוי אם אנחנו נמצאים בשלב ה-Build הסטטי של נקסט
const isBuildTime = process.env.NEXT_PHASE === 'phase-production-build' || !process.env.NEXTAUTH_SECRET;

const buildFallback = () => new Response(JSON.stringify({ status: "build_ok" }), { status: 200 });

export async function GET(request: Request, ctx: any) {
    if (isBuildTime) {
        return buildFallback();
    }
    
    // טעינה דינמית רק בזמן ריצה אמיתית ברשת של קלאודפלייר
    const NextAuth = (await import("next-auth")).default;
    const { authOptions } = await import("@/lib/auth");
    return NextAuth(authOptions)(request, ctx);
}

export async function POST(request: Request, ctx: any) {
    if (isBuildTime) {
        return buildFallback();
    }
    
    // טעינה דינמית רק בזמן ריצה אמיתית ברשת של קלאודפלייר
    const NextAuth = (await import("next-auth")).default;
    const { authOptions } = await import("@/lib/auth");
    return NextAuth(authOptions)(request, ctx);
}