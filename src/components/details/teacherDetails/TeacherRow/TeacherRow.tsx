import React from "react";
import { useMainContext } from "@/context/MainContext";
import { TeacherType } from "@/models/types/teachers";
import { teacherSchema } from "@/models/validation/teacher";
import ListRow from "@/components/ui/list/ListRow/ListRow";
import { TeacherRoleValues } from "@/models/types/teachers";
import useConfirmPopup from "@/hooks/useConfirmPopup";
import useSubmit from "@/hooks/useSubmit";
import messages from "@/resources/messages";
import { PopupAction } from "@/context/PopupContext";
import { generateSchoolUrl } from "@/utils";
import DeleteWarningContent from "@/components/popups/DeleteWarningContent/DeleteWarningContent";
import { countTeacherUsage } from "@/utils/entityUsage";

type TeacherRowProps = {
    teacher: TeacherType;
};

const TeacherRow: React.FC<TeacherRowProps> = ({ teacher }) => {
    const { handleOpenPopup } = useConfirmPopup();
    const { deleteTeacher, school, updateTeacher, annualScheduleTable } = useMainContext();

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
                    title={`האם למחוק את המורה "${teacher.name}"?`}
                    warningText={`המורה משובץ/ת ב-${usageCount} שיעורים במערכת השנתית.`}
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
        />
    );
};

export default TeacherRow;
