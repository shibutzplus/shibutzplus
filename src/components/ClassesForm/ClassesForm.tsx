"use client";

import React, { useEffect, useState } from "react";
import { ClassType, ClassRequest } from "@/models/types/classes";
import InputText from "../ui/InputText/InputText";
import Form from "../core/Form/Form";
import { useMainContext } from "@/context/MainContext";
import messages from "@/resources/messages";
import useSubmit from "@/hooks/useSubmit";

type ClassesFormProps = {
    selectedClass: ClassType | null;
};

const ClassesForm: React.FC<ClassesFormProps> = ({ selectedClass }) => {
    const { school, addNewClass } = useMainContext();
    const [formData, setFormData] = useState<ClassRequest>({
        name: selectedClass ? selectedClass.name : "",
        schoolId: selectedClass ? selectedClass.schoolId : school?.id || "",
    });

    const { handleSubmitAdd, isLoading, error } = useSubmit<ClassRequest>(
        setFormData,
        messages.classes.createSuccess,
        messages.classes.createError,
        messages.classes.invalid,
    );

    useEffect(() => {
        if (selectedClass) {
            setFormData({
                name: selectedClass.name,
                schoolId: selectedClass.schoolId,
            });
        } else if (school) {
            setFormData({
                name: "",
                schoolId: school?.id || "",
            });
        }
    }, [selectedClass, school]);

    const handleSubmit = async (e: React.FormEvent) => {
        handleSubmitAdd(e, formData, addNewClass);
    };

    return (
        <Form handleSubmit={handleSubmit} btnText="הוסף כיתה" isLoading={isLoading} error={error}>
            {[
                <InputText
                    key="name"
                    label="שם כיתה"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        setFormData((prev) => ({
                            ...prev,
                            [e.target.name]: e.target.value,
                        }));
                    }}
                    placeholder="לדוגמה: א1"
                    required
                />,
            ]}
        </Form>
    );
};

export default ClassesForm;

// const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setIsLoading(true);
//     setError("");

//     try {
//         if (!formData.schoolId || !formData.name) {
//             setError(messages.classes.invalid);
//             setIsLoading(false);
//             return;
//         }

//         const res = await addNewClass(formData);
//         toast.success(res ? messages.classes.createSuccess : messages.classes.createError);
//         setFormData({
//             name: "",
//             schoolId: school?.id || "",
//         });
//     } catch (error) {
//         console.error(error);
//         toast.error(messages.classes.createError);
//     } finally {
//         setIsLoading(false);
//     }
// };
