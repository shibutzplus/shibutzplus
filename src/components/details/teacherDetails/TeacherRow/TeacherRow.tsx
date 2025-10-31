import React from "react";
import { useMainContext } from "@/context/MainContext";
import { TeacherType } from "@/models/types/teachers";
import { teacherSchema } from "@/models/validation/teacher";
import ListRow from "@/components/ui/list/ListRow/ListRow";
import { TeacherRoleValues } from "@/models/types/teachers";
import useDeletePopup from "@/hooks/useDeletePopup";
import useSubmit from "@/hooks/useSubmit";
import messages from "@/resources/messages";
import { PopupAction } from "@/context/PopupContext";

type TeacherRowProps = {
    teacher: TeacherType;
};

const TeacherRow: React.FC<TeacherRowProps> = ({ teacher }) => {
    const { handleOpenPopup } = useDeletePopup();
    const { deleteTeacher, school, updateTeacher } = useMainContext();

    const { handleSubmitDelete } = useSubmit(
        () => {},
        messages.teachers.deleteSuccess,
        messages.teachers.deleteError,
        messages.teachers.invalid,
    );

    const handleDeleteTeacherFromState = async (teacherId: string) => {
        if (!school?.id) return;
        await handleSubmitDelete(school.id, teacherId, deleteTeacher);
    };

    const handleDeleteTeacher = (teacher: TeacherType) => {
        handleOpenPopup(PopupAction.deleteTeacher, `האם למחוק את המורה ${teacher.name}`, () =>
            handleDeleteTeacherFromState(teacher.id),
        );
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
        />
    );
};

export default TeacherRow;
