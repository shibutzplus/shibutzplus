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

    // isRegular is a very missleading name. It means that there is no change in the lesson.
    if (row.isRegular) {
        return "";
    }

    // If I am the main teacher
    const isOriginalTeacher = teacher.id === row.originalTeacher?.id;
    if (isOriginalTeacher) {
        const subName = row.subTeacher?.name;
        return subName ? `הזינו חומר לימוד ל${subName}` : "הזינו כאן הנחיות למורה המחליף";
    }

    // If I am the substitute teacher
    const isSubTeacher = teacher.id === row.subTeacher?.id;
    if (isSubTeacher) {
        const originalName = row.originalTeacher?.name;
        return originalName ? `לא התקבלו הנחיות/חומר לימוד מ${originalName}` : "לא הוזנו הנחיות לשיעור זה";
    }

    // Default for all others
    return "חומר הלימוד";
};
