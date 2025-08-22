"use client";

import React, { useState } from "react";
import { useMainContext } from "@/context/MainContext";
import messages from "@/resources/messages";
import InputText from "@/components/ui/InputText/InputText";
import { errorToast, successToast } from "@/lib/toast";
import { subjectSchema } from "@/models/validation/subject";
import Btn from "@/components/ui/Btn/Btn";
import { FaPlus } from "react-icons/fa6";

const AddSubjectRow: React.FC = () => {
    const { school, addNewSubject } = useMainContext();
    const [subjectValue, setSubjectValue] = useState<string>("");

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
                name: subjectValue,
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

            const res = await addNewSubject({
                name: subjectValue,
                schoolId: school?.id || "",
            });
            successToast(res ? messages.subjects.createSuccess : messages.subjects.createError);
            setSubjectValue("");
        } catch (error) {
            console.error(error);
            errorToast(messages.subjects.createError);
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
                    value={subjectValue}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        setSubjectValue(e.target.value);
                    }}
                    placeholder="לדוגמה: מתמטיקה"
                    error={validationErrors.name}
                />
            </td>
            <td>
                <Btn
                    text="הוספת מקצוע"
                    onClick={handleSubmitAdd}
                    isLoading={isLoading}
                    Icon={<FaPlus />}
                />
            </td>
        </tr>
    );
};

export default AddSubjectRow;
