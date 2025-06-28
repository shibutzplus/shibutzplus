"use client";

import React, { useEffect, useState } from "react";
import { SubjectType, SubjectRequest } from "@/models/types/subjects";
import Form from "../core/Form/Form";
import InputText from "../ui/InputText/InputText";
import { useMainContext } from "@/context/MainContext";
import messages from "@/resources/messages";
import useSubmit from "@/hooks/useSubmit";

type SubjectsFormProps = {
    selectedSubject: SubjectType | null;
};

const SubjectsForm: React.FC<SubjectsFormProps> = ({ selectedSubject }) => {
    const { school, addNewSubject } = useMainContext();

    const [formData, setFormData] = useState<SubjectRequest>({
        name: selectedSubject ? selectedSubject.name : "",
        schoolId: selectedSubject ? selectedSubject.schoolId : school?.id || "",
    });

    const { handleSubmitAdd, isLoading, error } = useSubmit<SubjectRequest>(
        setFormData,
        messages.subjects.createSuccess,
        messages.subjects.createError,
        messages.subjects.invalid,
    );

    useEffect(() => {
        if (selectedSubject) {
            setFormData({
                name: selectedSubject.name,
                schoolId: selectedSubject.schoolId,
            });
        } else if (school) {
            // Default to current school from context
            setFormData({
                name: "",
                schoolId: school.id,
            });
        }
    }, [selectedSubject, school]);

    const handleSubmit = async (e: React.FormEvent) => {
        handleSubmitAdd(e, formData, addNewSubject);
    };

    return (
        <Form handleSubmit={handleSubmit} isLoading={isLoading} btnText="הוסף מקצוע">
            {[
                <InputText
                    key="name"
                    label="שם מקצוע"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        setFormData((prev) => ({
                            ...prev,
                            [e.target.name]: e.target.value,
                        }));
                    }}
                    placeholder="לדוגמה: מתמטיקה"
                    required
                />,
            ]}
        </Form>
    );
};

export default SubjectsForm;
