import React from "react";
import { useMainContext } from "@/context/MainContext";
import { SubjectType } from "@/models/types/subjects";
import { subjectSchema } from "@/models/validation/subject";
import ListRow from "@/components/ui/list/ListRow/ListRow";
import useDeletePopup from "@/hooks/useDeletePopup";
import useSubmit from "@/hooks/useSubmit";
import messages from "@/resources/messages";
import { PopupAction } from "@/context/PopupContext";

type SubjectRowProps = {
    subject: SubjectType;
};

const SubjectRow: React.FC<SubjectRowProps> = ({ subject }) => {
    const { subjects, deleteSubject, school, updateSubject } = useMainContext();
    const { handleOpenPopup } = useDeletePopup();

    const { handleSubmitDelete } = useSubmit(
        () => {},
        messages.subjects.deleteSuccess,
        messages.subjects.deleteError,
        messages.subjects.invalid,
    );

    const handleDeleteSubjectFromState = async (subjectId: string) => {
        if (!school?.id) return;
        await handleSubmitDelete(school.id, subjectId, deleteSubject);
    };

    const handleDeleteSubject = (subject: SubjectType) => {
        handleOpenPopup(
            PopupAction.deleteSubject,
            `האם אתה בטוח שברצונך למחוק את המקצוע ${subject.name}`,
            () => handleDeleteSubjectFromState(subject.id),
        );
    };

    return (
        <ListRow
            item={subject}
            schema={subjectSchema}
            onUpdate={(id, data) =>
                updateSubject(id, {
                    name: (data.name ?? subject.name) as string,
                    schoolId: subject.schoolId,
                })
            }
            onDelete={handleDeleteSubject}
            field={{ key: "name", placeholder: "לדוגמה: מתמטיקה" }}
            getId={(s) => s.id}
            getInitialValue={(s) => s.name}
            updateExtraFields={() => ({ schoolId: subject.schoolId })}
        />
    );
};

export default SubjectRow;
