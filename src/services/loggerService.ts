import { db, schema, executeQuery } from "@/db";
import { gte, desc } from "drizzle-orm";

const ALERT_THRESHOLD = 5;
const ALERT_WINDOW_MINUTES = 10;
const ALERT_EMAIL = "shibutzplus@gmail.com";

async function sendAlertEmail(message: string) {
    try {
        await fetch("https://api.emailjs.com/api/v1.0/email/send", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                service_id: process.env.EMAILJS_SERVICE_ID || "",
                template_id: process.env.EMAILJS_ADMIN_TEMPLATE_ID || "",
                user_id: process.env.EMAILJS_PUBLIC_KEY || "",
                accessToken: process.env.EMAILJS_PRIVATE_KEY || "",
                template_params: {
                    adminName: "System Alert (Logs)",
                    adminEmail: ALERT_EMAIL,
                    message,
                },
            }),
        });
    } catch (_e) {
        // Silently ignore — email alert failure should never crash the calling code
    }
}

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
        const timeStamp = new Date();

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

        // Check if 5 errors occurred within the last 10 minutes
        const windowStart = new Date(timeStamp.getTime() - ALERT_WINDOW_MINUTES * 60 * 1000);
        const recentLogs = await db
            .select({
                timeStamp: schema.logs.timeStamp,
                user: schema.logs.user,
                description: schema.logs.description,
            })
            .from(schema.logs)
            .where(gte(schema.logs.timeStamp, windowStart))
            .orderBy(desc(schema.logs.timeStamp))
            .limit(ALERT_THRESHOLD + 1);

        if (recentLogs.length === ALERT_THRESHOLD) {
            const summary = recentLogs
                .map((l, i) => `${i + 1}. [${l.timeStamp.toISOString()}] (${l.user || "Unknown"}): ${l.description}`)
                .join("\n");
            await sendAlertEmail(`זוהו ${ALERT_THRESHOLD} שגיאות ב-${ALERT_WINDOW_MINUTES} הדקות האחרונות:\n\n${summary}`);
        }
    } catch (err) {
        // Send email alert if DB logging fails (e.g., Neon is down)
        await sendAlertEmail(
            `CRITICAL: כתיבה ללוג ב-Neon נכשלה!\n\nשגיאת DB: ${err instanceof Error ? err.message : String(err)}\nשגיאה מקורית: ${params.description}`
        );
    }
}
