import { TeacherScheduleType } from "@/models/types/portalSchedule";
import { TeacherType } from "@/models/types/teachers";

// Decide what placeholder to show inside the input
export const getInstructionPlaceholder = (row?: TeacherScheduleType, teacher?: TeacherType) => {

    // Safety Check
    if (!row || !teacher) {
        return "";
    }

    // If it's an activity lesson
    if (row.subject?.activity) {
        return "";
    }

    // If it's a regular lesson (for existing teacher who was not replaced by substitute)
    if (row.isRegular) {
        return "";
    }

    // If I am the main teacher
    const isOriginalTeacher = teacher.id === row.originalTeacher?.id;
    if (isOriginalTeacher) {
        return "הזינו כאן הנחיות למורה המחליף";
    }

    // If I am the substitute teacher
    const isSubTeacher = teacher.id === row.subTeacher?.id;
    if (isSubTeacher) {
        return "לא הוזנו הנחיות לשיעור זה";
    }

    // Default for all others
    return "חומר הלימוד";
};
