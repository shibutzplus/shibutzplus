import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const startUrl = searchParams.get('start_url') || '/';

    const manifest = {
        name: 'שיבוץ+',
        short_name: 'שיבוץ+',
        start_url: startUrl,
        scope: '/',
        id: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#ffffff',
        icons: [
            {
                src: '/logo192.png',
                sizes: '192x192',
                type: 'image/png',
            },
            {
                src: '/logo512.png',
                sizes: '512x512',
                type: 'image/png',
            },
        ],
    };

    return NextResponse.json(manifest, {
        headers: {
            'Content-Type': 'application/manifest+json',
        },
    });
}
