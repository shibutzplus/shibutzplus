"use client";

import React from "react";
import { useMainContext } from "@/context/MainContext";
import { TeacherRoleValues } from "@/models/types/teachers";
import { teacherSchema } from "@/models/validation/teacher";
import AddListRow from "@/components/ui/list/AddListRow/AddListRow";
import messages from "@/resources/messages";

type AddStaffRowProps = {
    onSearch?: (value: string) => void;
};

const AddStaffRow: React.FC<AddStaffRowProps> = ({ onSearch }) => {
    const { school, addNewTeacher } = useMainContext();
    return (
        <AddListRow
            schema={teacherSchema}
            addFunction={(values) =>
                addNewTeacher({
                    ...values,
                    schoolId: school?.id || "",
                    role: TeacherRoleValues.STAFF,
                })
            }
            field={{
                key: "name",
                placeholder: "לדוגמה: מזכירת בית הספר",
                maxLength: 20,
            }}
            initialValues={{ name: "" }}
            errorMessages={{ name: messages.teachers.createError }}
            onInputChange={onSearch}
            suppressErrorToast={true}
        />
    );
};

export default AddStaffRow;
