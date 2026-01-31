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
 * Log the errors to the database.
 */
export async function dbLog(params: LogParams) {
    try {
        const session = await getServerSession(authOptions).catch(() => null);
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
