/**
 * Push Notification Service
 *
 * Handles the server-side logic for sending web push notifications using the VAPID protocol.
 * Edge and Cloudflare Workers compatible (uses Web Crypto + standard fetch).
 * Notify users (teachers in public portal) about important updates, even when not actively using the app.
 */
import { db } from "@/db";
import { dbLog } from "@/services/loggerService";
import { pushSubscriptions } from "@/db/schema/push-subscriptions";
import { teachers } from "@/db/schema/teachers";
import { dailySchedule } from "@/db/schema/daily-schedule";
import { eq, and, inArray, isNotNull } from "drizzle-orm";
import { buildPushPayload } from "./webPushCrypto";

export async function sendNotification(
    subscription: { endpoint: string; keys: { p256dh: string; auth: string } },
    payload: string,
    schoolId?: string
) {
    const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY?.trim();
    const privateKey = process.env.VAPID_PRIVATE_KEY?.trim();

    if (!publicKey || !privateKey) {
        const msg = "VAPID keys are missing. Push notifications will not work.";
        void dbLog({ description: msg, schoolId: undefined });
        return { success: false, error: msg };
    }

    const vapid = {
        subject: "https://shibutzplus.com",
        publicKey,
        privateKey,
    };

    const pushSubscription = {
        endpoint: subscription.endpoint,
        expirationTime: null,
        keys: subscription.keys,
    };

    const MAX_RETRIES = 3;

    let pushPayload: Awaited<ReturnType<typeof buildPushPayload>>;
    try {
        pushPayload = await buildPushPayload(
            { data: payload, options: { ttl: 86400, urgency: "high" } },
            pushSubscription,
            vapid
        );
    } catch (err: any) {
        const msg = `Failed to build push payload: ${err instanceof Error ? err.message : String(err)}`;
        await dbLog({ description: msg, schoolId, metadata: { name: err?.name } });
        return { success: false, error: msg };
    }

    for (let i = 0; i < MAX_RETRIES; i++) {
        try {
            const res = await fetch(subscription.endpoint, {
                method: pushPayload.method,
                headers: pushPayload.headers,
                body: pushPayload.body as unknown as BodyInit,
                signal: AbortSignal.timeout(10000),
            });

            if (res.ok) {
                return { success: true };
            }

            const statusCode = res.status;

            if (statusCode === 410 || statusCode === 404) {
                // Subscription expired or gone
                return { success: false, expired: true };
            }

            const isTransientError = statusCode === 429 || (statusCode >= 500 && statusCode < 600);

            if (isTransientError && i < MAX_RETRIES - 1) {
                const delay = 500 * Math.pow(2, i);
                await new Promise((resolve) => setTimeout(resolve, delay));
                continue;
            }

            const errorBody = await res.text().catch(() => "");
            const errorDetails = {
                message: `Push service HTTP ${statusCode}: ${res.statusText}`,
                statusCode,
                body: errorBody,
            };

            await dbLog({
                description: `Error sending push notification (attempt ${i + 1}/${MAX_RETRIES}): ${errorDetails.message}`,
                schoolId,
                metadata: errorDetails,
            });

            return { success: false, error: errorDetails };
        } catch (error: any) {
            const isTransientError =
                error?.name === "TimeoutError" ||
                error?.name === "AbortError" ||
                error?.code === "ECONNRESET";

            if (isTransientError && i < MAX_RETRIES - 1) {
                const delay = 500 * Math.pow(2, i);
                await new Promise((resolve) => setTimeout(resolve, delay));
                continue;
            }

            const errorDetails = {
                message: error instanceof Error ? error.message : String(error),
                name: error?.name,
                code: error?.code,
            };

            await dbLog({
                description: `Error sending push notification (attempt ${i + 1}/${MAX_RETRIES}): ${errorDetails.message}`,
                schoolId,
                metadata: errorDetails,
            });

            return { success: false, error: errorDetails };
        }
    }
    return { success: false, error: "Max retries reached" };
}

export async function sendPublishNotification(schoolId: string, payload: { title: string; body: string; url: string }, date: string) {
    try {
        // 1. Get all Regular / Staff teachers
        const regularTeachersSubscriptions = await db
            .select({
                id: pushSubscriptions.id,
                endpoint: pushSubscriptions.endpoint,
                p256dh: pushSubscriptions.p256dh,
                auth: pushSubscriptions.auth,
                teacherId: pushSubscriptions.teacherId,
            })
            .from(pushSubscriptions)
            .innerJoin(teachers, eq(pushSubscriptions.teacherId, teachers.id))
            .where(
                and(
                    eq(pushSubscriptions.schoolId, schoolId),
                    inArray(teachers.role, ["regular", "staff"])
                )
            );

        // 2. Get Substitute teachers who are working on this specific date
        // First find the relevant substitute teacher IDs from the daily schedule
        const activeSubstitutes = await db
            .selectDistinct({ subTeacherId: dailySchedule.subTeacherId })
            .from(dailySchedule)
            .where(
                and(
                    eq(dailySchedule.schoolId, schoolId),
                    eq(dailySchedule.date, date),
                    isNotNull(dailySchedule.subTeacherId)
                )
            );

        const activeSubTeacherIds = activeSubstitutes
            .map(s => s.subTeacherId)
            .filter((id): id is string => id !== null);

        let substituteSubscriptions: typeof regularTeachersSubscriptions = [];

        if (activeSubTeacherIds.length > 0) {
            substituteSubscriptions = await db
                .select({
                    id: pushSubscriptions.id,
                    endpoint: pushSubscriptions.endpoint,
                    p256dh: pushSubscriptions.p256dh,
                    auth: pushSubscriptions.auth,
                    teacherId: pushSubscriptions.teacherId,
                })
                .from(pushSubscriptions)
                .innerJoin(teachers, eq(pushSubscriptions.teacherId, teachers.id))
                .where(
                    and(
                        eq(pushSubscriptions.schoolId, schoolId),
                        eq(teachers.role, "substitute"),
                        inArray(pushSubscriptions.teacherId, activeSubTeacherIds)
                    )
                );
        }

        // 3. Combine and Deduplicate (by subscription ID)
        const allSubscriptions = [...regularTeachersSubscriptions, ...substituteSubscriptions];
        const unique = new Map<string, typeof regularTeachersSubscriptions[0]>();
        allSubscriptions.forEach(sub => {
            if (!unique.has(sub.id)) {
                unique.set(sub.id, sub);
            }
        });

        const subscriptions = Array.from(unique.values());

        if (subscriptions.length === 0) {
            return { success: true, count: 0 };
        }

        let successCount = 0;
        let failCount = 0;

        // Process in smaller batches to avoid "socket hang up" and other concurrency issues
        const BATCH_SIZE = 50;

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
                            void dbLog({
                                description: `Failed to delete expired push subscription ${sub.id}: ${e instanceof Error ? e.message : String(e)}`,
                                schoolId
                            });
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
    } catch (error) {
        const errorMsg = `Error in sendPublishNotification: ${error instanceof Error ? error.message : String(error)}`;
        await dbLog({
            description: errorMsg,
            schoolId,
            metadata: { date }
        });
        return { success: false, error: errorMsg };
    }
}
