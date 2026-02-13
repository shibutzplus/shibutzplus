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

// Cache for auth modules to avoid repeated dynamic imports
let authModulesCache: {
    authOptions: any;
    getServerSession: any;
} | null = null;

// Lazy load auth modules
async function loadAuthModules() {
    if (authModulesCache) return authModulesCache;

    try {
        const [authLib, nextAuth] = await Promise.all([
            import("@/lib/auth"),
            import("next-auth")
        ]);

        authModulesCache = {
            authOptions: authLib.authOptions || (authLib as any).default?.authOptions || (authLib as any).default,
            getServerSession: nextAuth.getServerSession
        };

        return authModulesCache;
    } catch (_e) {
        // Fallback or silence error if running in a script without auth context
        return null;
    }
}

export async function dbLog(params: LogParams) {
    try {
        let session = null;
        const modules = await loadAuthModules();

        if (modules) {
            try {
                session = await modules.getServerSession(modules.authOptions).catch(() => null);
            } catch (_e) {
                // Ignore session fetch errors
            }
        }

        const resolvedUser = params.user || session?.user?.name || 'Unknown User';
        const resolvedSchoolId = params.schoolId || session?.user?.schoolId;
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
