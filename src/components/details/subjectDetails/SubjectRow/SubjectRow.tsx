import React from "react";
import { useMainContext } from "@/context/MainContext";
import { SubjectType } from "@/models/types/subjects";
import { subjectSchema } from "@/models/validation/subject";
import ListRow from "@/components/ui/list/ListRow/ListRow";

type SubjectRowProps = {
    subject: SubjectType;
    handleDeleteSubject: (subject: SubjectType) => void;
};

const SubjectRow: React.FC<SubjectRowProps> = ({ subject, handleDeleteSubject }) => {
    const { updateSubject } = useMainContext();
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
