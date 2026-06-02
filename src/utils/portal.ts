import { TeacherScheduleType } from "@/models/types/portalSchedule";
import { TeacherType } from "@/models/types/teachers";

// Decide what placeholder to show inside the input
export const getInstructionPlaceholder = (row?: TeacherScheduleType, teacher?: TeacherType): { text: string; color?: string } => {

    // Safety Check
    if (!row || !teacher) {
        return { text: "" };
    }

    // If it's an activity lesson
    if (row.subject?.activity) {
        return { text: "" };
    }

    // isRegular is a very missleading name. It means that there is no change in the lesson.
    if (row.isRegular) {
        return { text: "" };
    }

    // Cross replacement: Teacher A replaces Teacher B AND Teacher B replaces Teacher A
    const isCrossReplacement =
        row.originalTeacher && row.subTeacher &&
        row.secondary &&
        row.originalTeacher.id === row.secondary.subTeacher?.id &&
        row.subTeacher.id === row.secondary.originalTeacher?.id;

    if (isCrossReplacement) {
        return { text: `הזינו כאן את חומרי הלימוד (הצרחה)` };
    }

    // Chain replacement (e.g. A→B→C→D) - general warning placeholder for double chain replacements (replacing and being replaced)
    if (row.isChainOriginalReplacing && row.isChainSubReplaced) {
        return {
            text: "עקב שרשרת החלפות בשיעור זה, יש לתאם את חומר הלימוד ישירות מול המורים.",
            color: "#c04949ff"
        };
    }

    // Chain replacement (e.g. A→B→C→D) - warning placeholder for the last substitute in the chain
    if (row.isChainOriginalReplacing) {
        const originalName = row.originalTeacher?.name || "המורה";
        return {
            text: `עקב שרשרת החלפות בשיעור זה, יש לתאם את חומר הלימוד ישירות מול ${originalName}.`,
            color: "#c04949ff"
        };
    }

    // If I am the main teacher
    const isOriginalTeacher = teacher.id === row.originalTeacher?.id;
    const subName = row.subTeacher?.name;
    if (isOriginalTeacher) {
        return {
            text: subName ? `הזינו חומר לימוד ל${subName}` : ""
        };
    }

    // If I am the substitute teacher
    const isSubTeacher = teacher.id === row.subTeacher?.id;
    const originalName = row.originalTeacher?.name;
    if (isSubTeacher) {
        return {
            text: originalName ? `לא התקבל חומר לימוד מ${originalName}` : "לא התקבל חומרי לימוד לשיעור זה"
        };
    }

    return { text: "חומר הלימוד" };
};
