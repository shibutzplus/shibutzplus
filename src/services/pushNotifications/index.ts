/**
 * Push Notification Service
 *
 * What: Handles the server-side logic for sending web push notifications using the VAPID protocol.
 * Why: Notify users (teachers in public portal) about important updates, even when not actively using the app.
 */
import webpush from "web-push";
import { db } from "@/db";
import { dbLog } from "@/services/loggerService";
import { pushSubscriptions } from "@/db/schema/push-subscriptions";
import { eq } from "drizzle-orm";
import https from "https";

// Create a custom agent to reuse connections and avoid "socket hang up"
const agent = new https.Agent({
    keepAlive: true,
    keepAliveMsecs: 1000,
    maxSockets: 50, // Limit concurrent sockets
});

if (!process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
    const msg = "VAPID keys are missing. Push notifications will not work.";
    console.warn(msg);
    if (process.env.NODE_ENV === "production") {
        void dbLog({ description: msg, schoolId: undefined });
    }
} else {
    webpush.setVapidDetails(
        "mailto:shibutzplus@gmail.com",
        process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY.trim(),
        process.env.VAPID_PRIVATE_KEY.trim()
    );
}

export async function sendNotification(
    subscription: { endpoint: string; keys: { p256dh: string; auth: string } },
    payload: string,
    schoolId?: string
) {
    const MAX_RETRIES = 3; // Increased from 1 to 3

    for (let i = 0; i < MAX_RETRIES; i++) {
        try {
            await webpush.sendNotification(
                {
                    endpoint: subscription.endpoint,
                    keys: subscription.keys,
                },
                payload,
                {
                    agent, // Use the custom agent
                    timeout: 10000, // 10s timeout per request
                }
            );
            return { success: true };
        } catch (error: any) {
            const statusCode = error?.statusCode;
            // Check for transient network errors or rate limits
            const isTransientError =
                error?.code === 'ECONNRESET' ||
                error?.message?.includes('socket hang up') ||
                statusCode === 429 ||
                (statusCode >= 500 && statusCode < 600);

            if (isTransientError && i < MAX_RETRIES - 1) {
                // Wait a bit before retrying (exponential backoff: 500ms, 1000ms, 2000ms)
                const delay = 500 * Math.pow(2, i);
                await new Promise(resolve => setTimeout(resolve, delay));
                continue;
            }

            // Log detailed error info only on final failure or non-transient error
            const errorDetails = {
                message: error instanceof Error ? error.message : String(error),
                statusCode: statusCode,
                body: error?.body,
                headers: error?.headers
            };

            // Don't log 410/404 as errors, they are expected cleanup
            if (statusCode !== 410 && statusCode !== 404) {
                await dbLog({
                    description: `Error sending push notification (attempt ${i + 1}/${MAX_RETRIES}): ${errorDetails.message}`,
                    schoolId,
                    metadata: errorDetails
                });
            }

            if (statusCode === 410 || statusCode === 404) {
                // Subscription expired or gone
                return { success: false, expired: true };
            }

            return { success: false, error: errorDetails };
        }
    }
    return { success: false, error: "Max retries reached" };
}

export async function sendNotificationToSchool(schoolId: string, payload: { title: string; body: string; url: string }) {
    const subscriptions = await db.query.pushSubscriptions.findMany({
        where: eq(pushSubscriptions.schoolId, schoolId),
    });

    if (subscriptions.length === 0) {
        return { success: true, count: 0 };
    }

    let successCount = 0;
    let failCount = 0;

    // Process in smaller batches to avoid "socket hang up" and other concurrency issues
    const BATCH_SIZE = 30;

    for (let i = 0; i < subscriptions.length; i += BATCH_SIZE) {
        const batch = subscriptions.slice(i, i + BATCH_SIZE);

        const promises = batch.map(async (sub) => {
            let targetUrl = payload.url;
            if (sub.teacherId) {
                targetUrl = `${payload.url}/${sub.teacherId}`;
            }

            const notificationPayload = JSON.stringify({
                ...payload,
                url: targetUrl
            });

            const result = await sendNotification(
                {
                    endpoint: sub.endpoint,
                    keys: {
                        p256dh: sub.p256dh,
                        auth: sub.auth,
                    },
                },
                notificationPayload,
                schoolId
            );

            if (result.success) {
                successCount++;
            } else {
                failCount++;
                if (result.expired) {
                    // Remove expired subscription
                    try {
                        await db.delete(pushSubscriptions).where(eq(pushSubscriptions.id, sub.id));
                    } catch (e) {
                        console.error("Failed to delete expired subscription", e);
                    }
                }
            }
        });

        await Promise.all(promises);

        // Add a small delay between batches to allow sockets to recycle/cool down
        if (i + BATCH_SIZE < subscriptions.length) {
            await new Promise(resolve => setTimeout(resolve, 10));
        }
    }

    return { success: true, sent: successCount, failed: failCount };
}
