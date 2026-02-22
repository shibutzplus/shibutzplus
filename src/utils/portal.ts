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

    // Cross replacement: Teacher A replaces Teacher B AND Teacher B replaces Teacher A
    const isCrossReplacement =
        row.originalTeacher && row.subTeacher &&
        row.secondary &&
        row.originalTeacher.id === row.secondary.subTeacher?.id &&
        row.subTeacher.id === row.secondary.originalTeacher?.id;

    if (isCrossReplacement) {
        return `הזינו כאן חומרי לימוד הדדיים (הצרכה)`;
    }

    // Chain replacement (e.g. A→B→C→A) - can't be traced automatically, coordinate manually
    if (row.secondary) {
        return "שימו לב! במצב כזה השדה אינו רלוונטי והחילוף מחייב תיאום ישיר בין המורים";
    };

    // If I am the main teacher
    const isOriginalTeacher = teacher.id === row.originalTeacher?.id;
    const subName = row.subTeacher?.name;
    if (isOriginalTeacher) {
        return subName ? `הזינו חומר לימוד ל${subName}` : "הזינו כאן חומר לימוד למורה המחליף";
    }

    // If I am the substitute teacher
    const isSubTeacher = teacher.id === row.subTeacher?.id;
    const originalName = row.originalTeacher?.name;
    if (isSubTeacher) {
        return originalName ? `לא התקבל חומר לימוד מ${originalName}` : "לא התקבל חומרי לימוד לשיעור זה";
    }

    return "חומר הלימוד";
};
