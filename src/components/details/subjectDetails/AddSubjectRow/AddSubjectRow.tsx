import React from "react";
import { useMainContext } from "@/context/MainContext";
import messages from "@/resources/messages";
import { subjectSchema } from "@/models/validation/subject";
import AddListRow from "@/components/ui/list/AddListRow/AddListRow";

type AddSubjectRowProps = {
    onSearch?: (value: string) => void;
};

const AddSubjectRow: React.FC<AddSubjectRowProps> = ({ onSearch }) => {
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
                maxLength: 20,
            }}
            initialValues={{ name: "" }}
            errorMessages={{ name: messages.subjects.createError }}
            onInputChange={onSearch}
            suppressErrorToast={true}
        />
    );
};

export default AddSubjectRow;
