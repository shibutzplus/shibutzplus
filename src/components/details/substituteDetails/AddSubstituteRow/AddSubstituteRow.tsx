"use client";

import React from "react";
import { useMainContext } from "@/context/MainContext";
import { TeacherRoleValues } from "@/models/types/teachers";
import { teacherSchema } from "@/models/validation/teacher";
import AddListRow from "@/components/ui/list/AddListRow/AddListRow";
import messages from "@/resources/messages";

type AddSubstituteRowProps = {
    onSearch?: (value: string) => void;
};

const AddSubstituteRow: React.FC<AddSubstituteRowProps> = ({ onSearch }) => {
    const { school, addNewTeacher } = useMainContext();
    return (
        <AddListRow
            schema={teacherSchema}
            addFunction={(values) =>
                addNewTeacher({
                    ...values,
                    schoolId: school?.id || "",
                    role: TeacherRoleValues.SUBSTITUTE,
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
        />
    );
};

export default AddSubstituteRow;
