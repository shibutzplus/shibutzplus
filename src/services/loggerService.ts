import { db, schema, executeQuery } from "@/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export interface LogParams {
    schoolId?: string;
    user?: string;
    description: string;
    metadata?: any;
}

/**
 * Log an error to the database.
 * replaces console.error calls throughout the application.
 */
export async function dbLog(params: LogParams) {
    try {
        // Log to console as well for development visibility
        if (process.env.NODE_ENV === 'development') {
            console.log(`[DBLOG] ${params.description}`, {
                user: params.user,
                schoolId: params.schoolId,
                metadata: params.metadata
            });
        }

        const session = await getServerSession(authOptions).catch(() => null);
        const resolvedUser = params.user || session?.user?.name || 'System';
        const resolvedSchoolId = params.schoolId || session?.user?.schoolId;

        // Formatted IL Time for the description or metadata if they want to see it clearly
        const ilTime = new Date().toLocaleString("he-IL", { timeZone: "Asia/Jerusalem" });

        await executeQuery(async () => {
            return await db.insert(schema.logs).values({
                description: params.description,
                schoolId: resolvedSchoolId,
                user: resolvedUser,
                metadata: { ...params.metadata, ilTime },
            });
        });
    } catch (err) {
        // Fallback to console if DB logging fails
        console.error('CRITICAL: Database logging failed', err);
        console.error('Original error:', params.description);
    }
}
