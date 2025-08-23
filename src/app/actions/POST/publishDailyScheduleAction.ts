"use server";

import { db } from "@/db";
import { schools } from "@/db/schema/schools";
import { eq } from "drizzle-orm";
import { ActionResponse } from "@/models/types/actions";
import messages from "@/resources/messages";


export async function publishDailyScheduleAction(
  schoolId: string,
  date: string
): Promise<ActionResponse> {
  try {
    const school = await db.query.schools.findFirst({ where: eq(schools.id, schoolId) });
    if (!school) {
      return { success: false, message: messages.school.notFound };
    }
    // Don't add duplicate dates
    const publishDates = Array.isArray(school.publishDates) ? school.publishDates : [];
    if (publishDates.includes(date)) {
      return { success: true, message: messages.publish.alreadyPublished };
    }
    const updatedDates = [...publishDates, date];
    await db.update(schools)
      .set({ publishDates: updatedDates })
      .where(eq(schools.id, schoolId));
    return { success: true, message: messages.publish.success };
  } catch (error) {
    console.error("Error publishing daily schedule:", error);
    return { success: false, message: messages.common.serverError };
  }
}
