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
    const MAX_RETRIES = 2;
    for (let i = 0; i < MAX_RETRIES; i++) {
        try {
            await webpush.sendNotification(
                {
                    endpoint: subscription.endpoint,
                    keys: subscription.keys,
                },
                payload
            );
            return { success: true };
        } catch (error: any) {
            // Check for transient network errors
            const isTransientError =
                error?.code === 'ECONNRESET' ||
                error?.message?.includes('socket hang up');

            if (isTransientError && i < MAX_RETRIES - 1) {
                // Wait a bit before retrying (exponential backoff: 500ms, 1000ms, 2000ms)
                await new Promise(resolve => setTimeout(resolve, 500 * Math.pow(2, i)));
                continue;
            }

            dbLog({ description: `Error sending push notification (attempt ${i + 1}/${MAX_RETRIES}): ${error instanceof Error ? error.message : String(error)}`, schoolId });

            if (error.statusCode === 410) {
                // Subscription expired or gone
                return { success: false, expired: true };
            }

            return { success: false, error };
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

    // Process in batches to avoid "socket hang up" and other concurrency issues
    const BATCH_SIZE = 5;
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
                    await db.delete(pushSubscriptions).where(eq(pushSubscriptions.id, sub.id));
                }
            }
        });

        await Promise.all(promises);

        // Optional: short delay between batches to be extra safe
        if (i + BATCH_SIZE < subscriptions.length) {
            await new Promise((resolve) => setTimeout(resolve, 200));
        }
    }

    return { success: true, sent: successCount, failed: failCount };
}
