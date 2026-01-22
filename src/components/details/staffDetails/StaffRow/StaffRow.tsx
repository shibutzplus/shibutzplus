import React from "react";
import { useMainContext } from "@/context/MainContext";
import { TeacherType } from "@/models/types/teachers";
import { teacherSchema } from "@/models/validation/teacher";
import ListRow from "@/components/ui/list/ListRow/ListRow";
import { generateSchoolUrl } from "@/utils";
import { TeacherRoleValues } from "@/models/types/teachers";
import useConfirmPopup from "@/hooks/useConfirmPopup";
import useSubmit from "@/hooks/useSubmit";
import messages from "@/resources/messages";
import { PopupAction } from "@/context/PopupContext";

type StaffRowProps = {
    teacher: TeacherType;
};

const StaffRow: React.FC<StaffRowProps> = ({ teacher }) => {
    const { deleteTeacher, school, updateTeacher } = useMainContext();
    const { handleOpenPopup } = useConfirmPopup();

    const { handleSubmitDelete } = useSubmit(
        () => { },
        messages.teachers.deleteSuccess,
        messages.teachers.deleteError,
        messages.teachers.invalid,
    );

    const handleDeleteTeacherFromState = async (teacherId: string) => {
        if (!school?.id) return;
        await handleSubmitDelete(school.id, teacherId, deleteTeacher);
    };

    const handleDeleteTeacher = (teacher: TeacherType) => {
        handleOpenPopup(
            PopupAction.deleteTeacher,
            `האם למחוק את ${teacher.name}`,
            () => handleDeleteTeacherFromState(teacher.id),
        );
    };

    return (
        <ListRow
            item={teacher}
            schema={teacherSchema}
            onUpdate={(id, data) =>
                updateTeacher(id, {
                    name: (data.name ?? teacher.name) as string,
                    role: TeacherRoleValues.STAFF,
                    schoolId: teacher.schoolId,
                })
            }
            onDelete={handleDeleteTeacher}
            field={{ key: "name", placeholder: "לדוגמה: מזכירת בית הספר" }}
            getId={(t) => t.id}
            getInitialValue={(t) => t.name}
            updateExtraFields={() => ({
                role: TeacherRoleValues.STAFF,
                schoolId: teacher.schoolId,
            })}
            hasLink={generateSchoolUrl(teacher.schoolId, teacher.id)}
        />
    );
};

export default StaffRow;
