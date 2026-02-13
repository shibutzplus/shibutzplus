/**
 * Tags that helps the system to know what to refresh whenever something changes.
 */
export const cacheTags = {
    /**
     * Tag for all teacher schedules in a school.
     * Use this to invalidate all teachers when publishing or making school-wide changes.
     */
    schoolSchedule: (schoolId: string) => `school-${schoolId}-schedule`,

    /**
     * Tag for a specific teacher's schedule (across all dates).
     * Use this to invalidate a single teacher's cache.
     */
    teacherSchedule: (teacherId: string) => `teacher-${teacherId}-schedule`,

    /**
     * Tag for a specific teacher on a specific date.
     * Use this for granular invalidation of a single day.
     */
    teacherScheduleByDate: (teacherId: string, date: string) => `schedule-${teacherId}-${date}`,

    /**
     * Tag for the list of teachers in a school.
     * Invalidate when adding/removing/updating teachers.
     */
    teachersList: (schoolId: string) => `teachers-list-${schoolId}`,

    /**
     * Tag for the list of subjects in a school.
     * Invalidate when adding/removing/updating subjects.
     */
    subjectsList: (schoolId: string) => `subjects-list-${schoolId}`,

    /**
     * Tag for the list of classes in a school.
     * Invalidate when adding/removing/updating classes.
     */
    classesList: (schoolId: string) => `classes-list-${schoolId}`,

    /**
     * Tag for school data.
     * Invalidate when updating school settings or configuration.
     */
    school: (schoolId: string) => `school-${schoolId}`,

    /**
     * Tag for a specific teacher's data.
     * Invalidate when updating teacher information.
     */
    teacher: (teacherId: string) => `teacher-${teacherId}`,
};
