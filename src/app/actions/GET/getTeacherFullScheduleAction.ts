"use server"

import { DailyScheduleType, GetDailyScheduleResponse } from "@/models/types/dailySchedule"
import { checkAuthAndParams } from "@/utils/authUtils"
import messages from "@/resources/messages"
import { and, eq } from "drizzle-orm"
import { db, schema, executeQuery } from "../../../db"
import { getDayNumberByDate } from "@/utils/time"

const getTeacherFullScheduleAction = async (
    schoolId: string,
    teacherId: string,
    date: string,
): Promise<GetDailyScheduleResponse> => {
    try {
        const authError = await checkAuthAndParams({ teacherId, date })
        if (authError) {
            return authError as GetDailyScheduleResponse
        }

        //TODO: should it have +1 ?
        const day = getDayNumberByDate(new Date(date)) + 1
        const result = await executeQuery(async () => {
            // Get daily schedule entries for this teacher on this date
            const dailySchedules = await db.query.dailySchedule.findMany({
                where: and(
                    eq(schema.dailySchedule.date, date),
                    eq(schema.dailySchedule.subTeacherId, teacherId),
                ),
                with: {
                    class: true,
                    subject: true,
                    issueTeacher: true,
                    subTeacher: true,
                    school: true,
                },
            })

            // Get annual schedule entries for this teacher and day
            const annualSchedules = await db.query.annualSchedule.findMany({
                where: and(
                    eq(schema.annualSchedule.schoolId, schoolId),
                    eq(schema.annualSchedule.teacherId, teacherId),
                    eq(schema.annualSchedule.day, day),
                ),
                with: {
                    school: true,
                    class: true,
                    teacher: true,
                    subject: true,
                },
            })

            // Create a map of daily schedules by hour for quick lookup
            const dailyByHour = new Map<number, any>()
            dailySchedules.forEach((schedule) => {
                dailyByHour.set(schedule.hour, schedule)
            })

            const dailyResults: DailyScheduleType[] = dailySchedules.map((schedule) => ({
                id: schedule.id,
                date: new Date(schedule.date),
                day: schedule.day,
                hour: schedule.hour,
                columnId: schedule.columnId || `daily-${schedule.id}`,
                eventTitle: schedule.eventTitle || undefined,
                event: schedule.event || undefined,
                school: schedule.school,
                class: schedule.class || undefined,
                subject: schedule.subject || undefined,
                issueTeacher: schedule.issueTeacher || undefined,
                issueTeacherType: schedule.issueTeacherType || undefined,
                subTeacher: schedule.subTeacher || undefined,
                position: schedule.position || 0,
                instructions: schedule.instructions || undefined,
                createdAt: schedule.createdAt,
                updatedAt: schedule.updatedAt,
            }))

            const annualResults: DailyScheduleType[] = annualSchedules
                .filter((schedule) => !dailyByHour.has(schedule.hour))
                .map((schedule) => ({
                    id: `annual-${schedule.id}`,
                    date: new Date(date),
                    day: day.toString(),
                    hour: schedule.hour,
                    columnId: `annual-${schedule.id}`,
                    eventTitle: undefined,
                    event: undefined,
                    school: schedule.school,
                    class: schedule.class || undefined,
                    subject: schedule.subject || undefined,
                    issueTeacher: schedule.teacher || undefined,
                    issueTeacherType: "existingTeacher",
                    subTeacher: schedule.teacher || undefined,
                    position: 0,
                    instructions: undefined,
                    createdAt: schedule.createdAt,
                    updatedAt: schedule.updatedAt,
                }))

            const combinedResults = [...dailyResults, ...annualResults].sort(
                (a, b) => a.hour - b.hour,
            )

            return combinedResults
        })

        return {
            success: true,
            message: messages.dailySchedule.success,
            data: result,
        }
    } catch (error) {
        console.error("Error fetching teacher full schedule:", error)
        return {
            success: false,
            message: messages.common.serverError,
        }
    }
}

export default getTeacherFullScheduleAction
