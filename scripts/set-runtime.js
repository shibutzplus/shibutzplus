const fs = require('fs');
const path = require('path');

const targetFile = path.join(__dirname, '../src/app/api/auth/[...nextauth]/route.ts');
const mode = process.argv[2]; // 'dev' or 'prod'

if (!fs.existsSync(targetFile)) {
    console.error(`Target file not found: ${targetFile}`);
    process.exit(1);
}

let content = fs.readFileSync(targetFile, 'utf8');

if (mode === 'dev') {
    // Set runtime to nodejs for local development
    content = content.replace(
        /export\s+const\s+runtime\s*=\s*['"]edge['"];?/,
        "export const runtime = 'nodejs';"
    );
    console.log('Set Next-Auth API route runtime to: nodejs (development)');
} else if (mode === 'prod') {
    // Set runtime to edge for production Cloudflare Pages
    content = content.replace(
        /export\s+const\s+runtime\s*=\s*['"]nodejs['"];?/,
        "export const runtime = 'edge';"
    );
    console.log('Set Next-Auth API route runtime to: edge (production)');
} else {
    console.error(`Invalid mode: ${mode}. Must be 'dev' or 'prod'`);
    process.exit(1);
}

fs.writeFileSync(targetFile, content, 'utf8');
