"use client";

import React, { useState } from "react";
import { useMainContext } from "@/context/MainContext";
import messages from "@/resources/messages";
import InputText from "@/components/ui/InputText/InputText";
import { errorToast } from "@/lib/toast";
import { subjectSchema } from "@/models/validation/subject";
import Btn from "@/components/ui/buttons/Btn/Btn";
import { TeacherRequest } from "@/models/types/teachers";
import Icons from "@/style/icons";

const AddSubstituteRow: React.FC = () => {
    const { school, addNewTeacher } = useMainContext();
    const [teacherValue, setTeacherValue] = useState<string>("");

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [validationErrors, setValidationErrors] = useState<{
        name?: string;
        schoolId?: string;
    }>({});

    const handleSubmitAdd = async (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsLoading(true);
        setValidationErrors({});

        try {
            const validationResult = subjectSchema.safeParse({
                name: teacherValue,
                schoolId: school?.id || "",
            });

            if (!validationResult.success) {
                const fieldErrors: { name?: string; schoolId?: string } = {};
                validationResult.error.issues.forEach((issue) => {
                    const field = issue.path[0] as keyof typeof fieldErrors;
                    if (field === "name" || field === "schoolId") {
                        fieldErrors[field] = issue.message;
                    }
                });
                setValidationErrors(fieldErrors);
                setIsLoading(false);
                return;
            }

            const response = await addNewTeacher({
                name: teacherValue,
                role: "substitute",
                schoolId: school?.id || "",
                userId: null,
            } as TeacherRequest);
            setTeacherValue("");
            if (!response) {
                errorToast(messages.teachers.createError);
            }
        } catch (error) {
            console.error(error);
            errorToast(messages.teachers.createError);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <tr>
            <td>
                <InputText
                    key="addName"
                    id="name"
                    name="name"
                    value={teacherValue}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        setTeacherValue(e.target.value);
                    }}
                    placeholder="לדוגמא: ישראל ישראלי"
                    error={validationErrors.name}
                />
            </td>
            <td>
                <Btn
                    text="הוספה"
                    onClick={handleSubmitAdd}
                    isLoading={isLoading}
                    Icon={<Icons.plus />}
                />
            </td>
        </tr>
    );
};

export default AddSubstituteRow;
