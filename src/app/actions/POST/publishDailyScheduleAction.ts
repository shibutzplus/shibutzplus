"use server";

import { db } from "@/db";
import { schools } from "@/db/schema/schools";
import { eq } from "drizzle-orm";
import { ActionResponse } from "@/models/types/actions";


export async function publishDailyScheduleAction(
  schoolId: string,
  date: string
): Promise<ActionResponse> {
  try {
    const school = await db.query.schools.findFirst({ where: eq(schools.id, schoolId) });
    if (!school) {
      return { success: false, message: "School not found" };
    }
    // Don't add duplicate dates
    const publishDates = Array.isArray(school.publishDates) ? school.publishDates : [];
    if (publishDates.includes(date)) {
      return { success: true, message: "Date already published" };
    }
    const updatedDates = [...publishDates, date];
    await db.update(schools)
      .set({ publishDates: updatedDates })
      .where(eq(schools.id, schoolId));
    return { success: true, message: "Date published successfully" };
  } catch (error) {
    console.error("Error publishing daily schedule:", error);
    return { success: false, message: "Failed to publish date" };
  }
}
