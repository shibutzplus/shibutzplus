/**
 * Remember this device so we can notify it
 * 1. Takes the user's subscription (their device unique ID for notifications).
 * 2. Saves it in the database so we can send them messages later.
 * 3. Connects it to a specific School and optionally a Teacher.
 */
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { pushSubscriptions } from "@/db/schema/push-subscriptions";
import { createId } from "@paralleldrive/cuid2";
import { eq } from "drizzle-orm";
import { dbLog } from "@/services/loggerService";

export async function POST(req: NextRequest) {

    let schoolId: string | undefined;
    let teacherId: string | undefined;

    try {
        const body = await req.json();
        const { subscription } = body;
        schoolId = body.schoolId;
        teacherId = body.teacherId;

        if (!subscription || !schoolId) {
            return NextResponse.json({ error: "Missing subscription or schoolId" }, { status: 400 });
        }

        const existing = await db.query.pushSubscriptions.findFirst({
            where: (table, { eq, and }) => and(
                eq(table.endpoint, subscription.endpoint),
                eq(table.schoolId, schoolId!)
            ),
        });

        if (existing) {
            // Update teacherId if provided, so we know the *last* teacher they visited
            if (teacherId && existing.teacherId !== teacherId) {
                await db.update(pushSubscriptions)
                    .set({ teacherId })
                    .where(eq(pushSubscriptions.id, existing.id));
            }
            return NextResponse.json({ success: true, message: "Already subscribed" });
        }

        // Insert new subscription
        await db.insert(pushSubscriptions).values({
            id: createId(),
            schoolId,
            teacherId: teacherId || null,
            endpoint: subscription.endpoint,
            p256dh: subscription.keys.p256dh,
            auth: subscription.keys.auth,
            // principalId defaults to null
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        await dbLog({
            description: `Error saving subscription: ${error instanceof Error ? error.message : String(error)}`,
            schoolId: schoolId || "unknown",
            user: teacherId || "unknown",
            metadata: error
        });
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
