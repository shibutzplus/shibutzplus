import { db, schema, executeQuery } from "@/db";
import { israelTimezoneDate } from "@/utils/time";

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
            // Dynamically import auth to avoid circular dependency and edge module loading issues.
            // auth() reads from the incoming request headers — returns null outside request context.
            const { auth } = await import("@/auth");
            session = await auth();
        } catch (_e) {
            // Silently ignore — logging should never crash the calling code
        }

        const resolvedUser = params.user || (session?.user as any)?.name || 'Unknown User';
        const resolvedSchoolId = params.schoolId || (session?.user as any)?.schoolId;
        const timeStamp = israelTimezoneDate();

        // Ensure metadata is safe to serialize
        let safeMetadata = params.metadata || {};
        try {
            safeMetadata = JSON.parse(JSON.stringify(safeMetadata));
        } catch (_e) {
            safeMetadata = { error: 'Non-serializable metadata' };
        }

        await executeQuery(async () => {
            return await db.insert(schema.logs).values({
                description: params.description,
                schoolId: resolvedSchoolId,
                user: resolvedUser,
                metadata: safeMetadata,
                timeStamp: timeStamp
            });
        });
    } catch (err) {
        // Fallback to console if DB logging fails
        console.error('CRITICAL: Database logging failed', err);
        console.error('Original error:', params.description);
    }
}
