# Cloudflare Edge Runtime Compatibility & Database Query Guidelines

This document explains the technical challenges encountered when deploying the Next.js application to Cloudflare Pages (Edge Runtime), the solutions implemented, and best practices for future development.

---

## 1. Drizzle Relational Queries (`db.query`) vs. Standard Selects

### The Problem
Drizzle's Relational Queries API (`db.query.tableName.findMany` / `findFirst`) is convenient but abstracts away the underlying SQL execution. Under the hood, it often generates multiple queries or complex structures to resolve relations. 
In a serverless, database-pooled, or Cloudflare Edge environment (using `@neondatabase/serverless` over HTTP/WebSockets), this abstraction can cause:
1. **Connection Hangs / Locks**: Multiple concurrent relational queries can exhaust connection slots or timeout.
2. **Empty Results**: Intermittent silent failures where Edge functions fail to resolve nested relations correctly.
3. **Performance Overhead**: Higher latency compared to raw SQL queries.

### The Solution
Use explicit Drizzle `db.select()` queries with standard SQL joins (`leftJoin`, `innerJoin`).
- **Single SQL Query**: Guarantees that only a single, optimized SQL query is sent to Neon.
- **Full Edge Compatibility**: Explicit SELECT/JOIN queries run predictably and efficiently on Edge workers.

### Code Example (Refactoring Pattern)

**Before (Avoid in performance-critical/Edge routes):**
```typescript
const schedules = await db.query.annualSchedule.findMany({
    where: eq(schema.annualSchedule.schoolId, schoolId),
    with: {
        class: true,
        subject: true,
    }
});
```

**After (Recommended):**
```typescript
const rows = await db
    .select({
        id: schema.annualSchedule.id,
        day: schema.annualSchedule.day,
        hour: schema.annualSchedule.hour,
        class: schema.classes,
        subject: schema.subjects,
    })
    .from(schema.annualSchedule)
    .leftJoin(schema.classes, eq(schema.annualSchedule.classId, schema.classes.id))
    .leftJoin(schema.subjects, eq(schema.annualSchedule.subjectId, schema.subjects.id))
    .where(eq(schema.annualSchedule.schoolId, schoolId));

// Map results back to structured format
const schedules = rows.map((r) => ({
    ...r,
    class: r.class && r.class.id ? r.class : null,
    subject: r.subject && r.subject.id ? r.subject : null,
}));
```

---

## 2. Node.js Modules in Edge Runtime (`__import_unsupported`)

### The Problem
Modules like `web-push` and native Node.js APIs (such as `crypto` or `https`) rely on Node.js-specific binaries or APIs.
When a page or a Server Action is configured with `export const runtime = "edge"`, Next.js bundles and evaluates all imports at compile-time. If a module contains static imports of unsupported Node APIs:
1. Webpack stubs them (using fallbacks like `crypto: false`).
2. At runtime, evaluating the module throws a crash:
   `ReferenceError: __import_unsupported is not defined`
This happens even if the specific Node-dependent code is never executed during rendering.

### The Solution
1. **Dynamic Imports**: Import the Node-dependent library dynamically inside the functions where they are actually needed, rather than at the top of the file.
2. **Conditional Environment Checks**: Avoid using or passing Node-specific structures (like `https.Agent`) when running inside the Edge environment.

### Code Example (Dynamic Import Pattern)

**Before (Causes build/dev crash):**
```typescript
import webpush from "web-push";
import https from "https";

const agent = new https.Agent({ keepAlive: true });

export async function sendNotification(subscription, payload) {
    await webpush.sendNotification(subscription, payload, { agent });
}
```

**After (Edge Safe):**
```typescript
let agent: any = undefined;

async function getHttpsAgent() {
    if (agent !== undefined) return agent;
    try {
        // Only load Node's 'https' if we are in a Node environment (or nodejs_compat support is available)
        const https = (await import("https")).default;
        agent = new https.Agent({ keepAlive: true });
    } catch (e) {
        agent = null; // Fallback to standard fetch
    }
    return agent;
}

export async function sendNotification(subscription, payload) {
    const webpush = (await import("web-push")).default;
    const agentInstance = await getHttpsAgent();
    
    await webpush.sendNotification(subscription, payload, {
        ...(agentInstance ? { agent: agentInstance } : {}),
    });
}
```

---

## 3. General Best Practices for Cloudflare Pages Deployments

1. **Verify Local Builds**: Always test the build locally using `npm run build` before pushing to verify there are no TypeScript or bundling issues.
2. **Neon Connection String**: Ensure that `DATABASE_URL` in production (Cloudflare dashboard) points to the direct Neon address (without `-pooler`), as connection pooling via transaction poolers is not supported/needed over serverless HTTP drivers.
3. **Database Logging**: All dynamic DB calls should be wrapped inside `executeQuery` or standard try/catch blocks that invoke `dbLog` to easily diagnose queries that fail in production.
