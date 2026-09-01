export const runtime = 'edge';
export const dynamic = 'force-dynamic';

// CF_PAGES_COMMIT_SHA is set automatically by Cloudflare Pages at runtime.
const BUILD_VERSION =
    process.env.CF_PAGES_COMMIT_SHA ||
    process.env.NEXT_PUBLIC_BUILD_ID ||
    null;

export async function GET() {
    return Response.json(
        { version: BUILD_VERSION },
        {
            headers: {
                'Cache-Control': 'no-store, no-cache, must-revalidate',
                'Pragma': 'no-cache',
            },
        }
    );
}
