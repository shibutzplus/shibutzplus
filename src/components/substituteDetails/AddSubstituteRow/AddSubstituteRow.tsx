"use client";

import React from "react";
import { useMainContext } from "@/context/MainContext";
import messages from "@/resources/messages";
import AddListRow from "@/components/ui/list/AddListRow/AddListRow";
import { teacherSchema } from "@/models/validation/teacher";

const AddSubstituteRow: React.FC = () => {
    const { school, addNewTeacher } = useMainContext();
    return (
        <AddListRow
            schema={teacherSchema}
            addFunction={(values) =>
                addNewTeacher({
                    ...values,
                    schoolId: school?.id || "",
                    role: "substitute",
                })
            }
            field={{
                key: "name",
                placeholder: "לדוגמה: ישראל ישראלי",
            }}
            initialValues={{ name: "" }}
            errorMessages={{ name: messages.teachers.createError }}
            buttonLabel="הוספה"
        />
    );
};

export default AddSubstituteRow;
