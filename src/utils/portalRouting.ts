import router from "@/routes";
import { getPublishedDatesOptions } from "@/resources/dayOptions";
import { chooseDefaultDate } from "@/utils/time";
import { TeacherRoleValues } from "@/models/types/teachers";

/**
 * Determines the portal entry path based on teacher role and schedule status:
 * - STAFF → schedule view
 * - SUBSTITUTE → regular daily schedule
 * - REGULAR → if not published & displayAltSchedule enabled → alt schedule, else regular schedule
 */
export function getPortalEntryPath(
    role: string | undefined,
    schoolId: string,
    teacherId: string,
    publishDates: string[],
    displayAltSchedule: boolean,
): string {

    // STAFF Teacher
    if (role === TeacherRoleValues.STAFF) {
        return router.scheduleViewPortal.p;
    }

    // SUBSTITUTE Teacher
    if (role === TeacherRoleValues.SUBSTITUTE) {
        return `${router.teacherMaterialPortal.p}/${schoolId}/${teacherId}`;
    }

    // REGULAR Teacher
    if (displayAltSchedule) {   // check if alt schedule should be displayed
        const defaultDate = chooseDefaultDate();
        const publishedOptions = getPublishedDatesOptions(publishDates);
        const isPublished = publishedOptions.some((d) => d.value === defaultDate);

        if (!isPublished) { // Display alt schedule
            return `${router.teacherMaterialAltPortal.p}/${schoolId}/${teacherId}`;
        }
    }

    // Display regular schedule
    return `${router.teacherMaterialPortal.p}/${schoolId}/${teacherId}`;
}

