import React from "react";
import { useMainContext } from "@/context/MainContext";
import messages from "@/resources/messages";
import AddListRow from "@/components/ui/list/AddListRow/AddListRow";
import { teacherSchema } from "@/models/validation/teacher";
import { TeacherRoleValues } from "@/models/types/teachers";

type AddTeacherRowProps = {
    onSearch?: (value: string) => void;
};

const AddTeacherRow: React.FC<AddTeacherRowProps> = ({ onSearch }) => {
    const { school, addNewTeacher } = useMainContext();

    return (
        <AddListRow
            schema={teacherSchema}
            addFunction={(values) =>
                addNewTeacher({
                    ...values,
                    schoolId: school?.id || "",
                    role: TeacherRoleValues.REGULAR,
                })
            }
            field={{
                key: "name",
                placeholder: "לדוגמה: ישראל ישראלי",
                maxLength: 20,
            }}
            initialValues={{ name: "" }}
            errorMessages={{ name: messages.teachers.createError }}
            buttonLabel="הוספה"
            onInputChange={onSearch}
            suppressErrorToast={true}
        />
    );
};

export default AddTeacherRow;
