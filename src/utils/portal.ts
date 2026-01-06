import { TeacherScheduleType } from "@/models/types/portalSchedule";
import { TeacherType } from "@/models/types/teachers";

// Decide what placeholder to show inside the input
export const getInstructionPlaceholder = (row?: TeacherScheduleType, teacher?: TeacherType) => {
    if (!row || !teacher) return "חומר הלימוד";

    const isIssueTeacher = teacher.id === row.issueTeacher?.id;
    const isSubTeacher = teacher.id === row.subTeacher?.id;

    // If I am the main teacher
    if (isIssueTeacher) {
        return row.subTeacher ? "הזינו כאן הנחיות למורה המחליף" : "";
    }

    // If I am the substitute teacher
    if (isSubTeacher) {
        return "לא הוזנו הנחיות לשיעור זה מהמורה";
    }

    // Default for all others
    return "חומר הלימוד";
};
