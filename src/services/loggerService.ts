import { db, schema, executeQuery } from "@/db";

export interface LogParams {
    schoolId?: string;
    user?: string;
    description: string;
    metadata?: any;
}

/**
 * Log the errors to the database.
 */

export async function dbLog(params: LogParams) {
    try {
        let session = null;
        try {
            // Dynamically import authOptions to avoid loading server dependencies (like server-only)
            // when running in scripts or contexts where auth isn't needed/available.
            const { authOptions } = await import("@/lib/auth");
            const { getServerSession } = await import("next-auth");
            session = await getServerSession(authOptions).catch(() => null);
        } catch (e) {
            // Ignore auth load errors (e.g. running in script)
        }

        const resolvedUser = params.user || session?.user?.name || 'Unknown User';
        const resolvedSchoolId = params.schoolId || session?.user?.schoolId;
        const timeStamp = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Jerusalem" }));

        await executeQuery(async () => {
            return await db.insert(schema.logs).values({
                description: params.description,
                schoolId: resolvedSchoolId,
                user: resolvedUser,
                metadata: params.metadata,
                timeStamp: timeStamp
            });
        });
    } catch (err) {
        // Fallback to console if DB logging fails
        console.error('CRITICAL: Database logging failed', err);
        console.error('Original error:', params.description);
    }
}
