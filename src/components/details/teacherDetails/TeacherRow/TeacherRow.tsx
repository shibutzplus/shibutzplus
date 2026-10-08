import React, { useState } from "react";
import { useMainContext } from "@/context/MainContext";
import { TeacherType } from "@/models/types/teachers";
import { teacherSchema } from "@/models/validation/teacher";
import ListRow from "@/components/ui/list/ListRow/ListRow";
import IconBtn from "@/components/ui/buttons/IconBtn/IconBtn";
import Icons from "@/style/icons";
import { TeacherRoleValues } from "@/models/types/teachers";
import useConfirmPopup from "@/hooks/useConfirmPopup";
import useSubmit from "@/hooks/useSubmit";
import messages from "@/resources/messages";
import { PopupAction } from "@/context/PopupContext";
import { generateSchoolUrl } from "@/utils";
import DeleteWarningContent from "@/components/popups/DeleteWarningContent/DeleteWarningContent";
import { countTeacherUsage } from "@/utils/entityUsage";
import { getTeacherUsageAction } from "@/app/actions/GET/getTeacherUsageAction";
import { successToast, errorToast } from "@/lib/toast";
type TeacherRowProps = {
    teacher: TeacherType;
};

const TeacherRow: React.FC<TeacherRowProps> = ({ teacher }) => {
    const { handleOpenPopup } = useConfirmPopup();
    const { deleteTeacher, school, updateTeacher, toggleTeacherPause, annualScheduleTable } = useMainContext();
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

    const handleDeleteTeacher = async (teacher: TeacherType) => {
        if (!school?.id) return;

        let totalUsage = countTeacherUsage(teacher.id, annualScheduleTable);

        try {
            const usageRes = await getTeacherUsageAction(school.id, teacher.id);
            if (usageRes.success && usageRes.usage) {
                totalUsage = usageRes.usage.totalCount;
            }
        } catch {
            // fallback to client count
        }

        if (totalUsage > 0) {
            handleOpenPopup(
                PopupAction.deleteTeacher,
                <DeleteWarningContent
                    title={`האם למחוק את המורה "${teacher.name}"?`}
                    warningText={`המורה משובץ/ת ב-${totalUsage} שיעורים במערכת השנתית.`}
                    usageCount={totalUsage}
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
                        ? `המורה ${teacher.name} הועבר/ה לסטטוס לא פעיל`
                        : `המורה ${teacher.name} חזר/ה לפעילות`
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
                    role: TeacherRoleValues.REGULAR,
                    schoolId: teacher.schoolId,
                })
            }
            onDelete={handleDeleteTeacher}
            field={{ key: "name", placeholder: "לדוגמא: ישראל ישראלי" }}
            getId={(t) => t.id}
            getInitialValue={(t) => t.name}
            updateExtraFields={() => ({
                role: TeacherRoleValues.REGULAR,
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
                            ? "מורה לא פעיל/ה זמנית (לחצו להחזרה לפעילות)"
                            : "העברה לסטטוס לא פעיל זמנית, דוגמא: חופשת לידה"
                    }
                />
            }
        />
    );
};

export default TeacherRow;
