import React from "react";
import { useMainContext } from "@/context/MainContext";
import messages from "@/resources/messages";
import { subjectSchema } from "@/models/validation/subject";
import AddListRow from "@/components/ui/list/AddListRow/AddListRow";

const AddSubjectRow: React.FC = () => {
    const { school, addNewSubject } = useMainContext();
    return (
        <AddListRow
            schema={subjectSchema}
            addFunction={(values) =>
                addNewSubject({
                    ...values,
                    schoolId: school?.id || "",
                })
            }
            field={{
                key: "name",
                placeholder: "לדוגמה: מתמטיקה",
            }}
            initialValues={{ name: "" }}
            errorMessages={{ name: messages.subjects.createError }}
            buttonLabel="הוספה"
        />
    );
};

export default AddSubjectRow;
