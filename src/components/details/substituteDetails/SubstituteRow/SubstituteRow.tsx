import React, { useState } from "react";
import { useMainContext } from "@/context/MainContext";
import { TeacherType } from "@/models/types/teachers";
import { teacherSchema } from "@/models/validation/teacher";
import ListRow from "@/components/ui/list/ListRow/ListRow";
import IconBtn from "@/components/ui/buttons/IconBtn/IconBtn";
import Icons from "@/style/icons";
import { generateSchoolUrl } from "@/utils";
import { TeacherRoleValues } from "@/models/types/teachers";
import useConfirmPopup from "@/hooks/useConfirmPopup";
import useSubmit from "@/hooks/useSubmit";
import messages from "@/resources/messages";
import { PopupAction } from "@/context/PopupContext";
import DeleteWarningContent from "@/components/popups/DeleteWarningContent/DeleteWarningContent";
import { countTeacherUsage } from "@/utils/entityUsage";
import { successToast, errorToast } from "@/lib/toast";
type SubstituteRowProps = {
    teacher: TeacherType;
};

const SubstituteRow: React.FC<SubstituteRowProps> = ({ teacher }) => {
    const { deleteTeacher, school, updateTeacher, toggleTeacherPause, annualScheduleTable } = useMainContext();
    const { handleOpenPopup } = useConfirmPopup();
    const [isPauseLoading, setIsPauseLoading] = useState(false);

    const { handleSubmitDelete } = useSubmit(
        () => { },
        messages.teachers.deleteSuccess,
        messages.teachers.deleteError,
        messages.teachers.invalid,
    );

    const handleDeleteTeacherFromState = async (teacherId: string, force: boolean = false) => {
        if (!school?.id) return;
        await handleSubmitDelete(school.id, teacherId, deleteTeacher, force);
    };

    const handleDeleteTeacher = (teacher: TeacherType) => {
        const usageCount = countTeacherUsage(teacher.id, annualScheduleTable);

        if (usageCount > 0) {
            handleOpenPopup(
                PopupAction.deleteTeacher,
                <DeleteWarningContent
                    title={`האם למחוק את ממלא/ת המקום "${teacher.name}"?`}
                    warningText={`ממלא/ת המקום משובץ/ת ב-${usageCount} שיעורים במערכת השנתית.`}
                    usageCount={usageCount}
                />,
                () => handleDeleteTeacherFromState(teacher.id, true),
                "מחק בכל זאת",
                "ביטול",
                "no",
            );
        } else {
            handleOpenPopup(
                PopupAction.deleteTeacher,
                `האם למחוק את המורה ${teacher.name}?`,
                () => handleDeleteTeacherFromState(teacher.id, false),
            );
        }
    };

    const handleTogglePause = async () => {
        const newIsPaused = !teacher.isPaused;
        try {
            setIsPauseLoading(true);
            const res = await toggleTeacherPause(teacher.schoolId, teacher.id, newIsPaused);
            if (res) {
                successToast(
                    newIsPaused
                        ? `ממלא/ת המקום ${teacher.name} הועבר/ה לסטטוס לא פעיל`
                        : `ממלא/ת המקום ${teacher.name} חזר/ה לפעילות`
                );
            } else {
                errorToast("בשל בעיית רשת רגעית יש לבצע את הפעולה מחדש");
            }
        } catch {
            errorToast("בשל בעיית רשת רגעית יש לבצע את הפעולה מחדש");
        } finally {
            setIsPauseLoading(false);
        }
    };

    return (
        <ListRow
            item={teacher}
            schema={teacherSchema}
            onUpdate={(id, data) =>
                updateTeacher(id, {
                    name: (data.name ?? teacher.name) as string,
                    role: TeacherRoleValues.SUBSTITUTE as import("@/models/types/teachers").TeacherRole,
                    schoolId: teacher.schoolId,
                })
            }
            onDelete={handleDeleteTeacher}
            field={{ key: "name", placeholder: "לדוגמה: ישראל ישראלי" }}
            getId={(t) => t.id}
            getInitialValue={(t) => t.name}
            updateExtraFields={() => ({
                role: TeacherRoleValues.SUBSTITUTE as import("@/models/types/teachers").TeacherRole,
                schoolId: teacher.schoolId,
            })}
            hasLink={generateSchoolUrl(teacher.schoolId, teacher.id)}
            extraActions={
                <IconBtn
                    onClick={handleTogglePause}
                    isLoading={isPauseLoading}
                    Icon={teacher.isPaused ? <Icons.play /> : <Icons.pause />}
                    title={
                        teacher.isPaused
                            ? "ממלא/ת מקום לא פעיל/ה זמנית (לחצו להחזרה לפעילות)"
                            : "העברה לסטטוס לא פעיל זמנית, דוגמא: חופשת לידה"
                    }
                />
            }
        />
    );
};

export default SubstituteRow;
