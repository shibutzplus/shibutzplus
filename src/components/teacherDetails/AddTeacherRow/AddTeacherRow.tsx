"use client";

import React, { useState } from "react";
import { useMainContext } from "@/context/MainContext";
import messages from "@/resources/messages";
import InputText from "@/components/ui/InputText/InputText";
import { errorToast, successToast } from "@/lib/toast";
import { subjectSchema } from "@/models/validation/subject";
import Btn from "@/components/ui/buttons/Btn/Btn";
import { FaPlus } from "react-icons/fa6";
import { TeacherRequest, TeacherRole, TeacherRoleValues } from "@/models/types/teachers";
import RadioGroup from "@/components/ui/RadioGroup/RadioGroup";

const AddTeacherRow: React.FC = () => {
    const { school, addNewTeacher } = useMainContext();
    const [teacherValue, setTeacherValue] = useState<string>("");
    const [roleValue, setRoleValue] = useState<TeacherRole>(TeacherRoleValues.REGULAR);

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [validationErrors, setValidationErrors] = useState<{
        name?: string;
        role?: string;
        schoolId?: string;
    }>({});

    const handleSubmitAdd = async (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsLoading(true);
        setValidationErrors({});

        try {
            const validationResult = subjectSchema.safeParse({
                name: teacherValue,
                role: roleValue,
                schoolId: school?.id || "",
            });

            if (!validationResult.success) {
                const fieldErrors: { name?: string; role?: string; schoolId?: string } = {};
                validationResult.error.issues.forEach((issue) => {
                    const field = issue.path[0] as keyof typeof fieldErrors;
                    if (field === "name" || field === "role" || field === "schoolId") {
                        fieldErrors[field] = issue.message;
                    }
                });
                setValidationErrors(fieldErrors);
                setIsLoading(false);
                return;
            }

            const res = await addNewTeacher({
                name: teacherValue,
                role: roleValue,
                schoolId: school?.id || "",
                userId: null,
            } as TeacherRequest);
            successToast(res ? messages.teachers.createSuccess : messages.teachers.createError);
            setTeacherValue("");
            setRoleValue(TeacherRoleValues.REGULAR);
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
                <RadioGroup
                    name="role"
                    value={roleValue}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        setRoleValue(e.target.value as TeacherRole);
                    }}
                    options={[
                        { value: TeacherRoleValues.REGULAR, label: "מורה" },
                        { value: TeacherRoleValues.SUBSTITUTE, label: "מורה מחליף/ה" },
                    ]}
                />
            </td>
            <td>
                <Btn
                    text="הוספת מורה"
                    onClick={handleSubmitAdd}
                    isLoading={isLoading}
                    Icon={<FaPlus />}
                />
            </td>
        </tr>
    );
};

export default AddTeacherRow;
