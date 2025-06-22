"use client";

import React, { useEffect, useState } from "react";
import { SubjectType, SubjectRequest } from "@/models/types/subjects";
import Form from "../core/Form/Form";
import InputText from "../ui/InputText/InputText";
import { useMainContext } from "@/context/MainContext";
import { addSubjectAction } from "@/app/actions/addSubjectAction";
import messages from "@/resources/messages";

type SubjectsFormProps = {
    selectedSubject: SubjectType | null;
};

const SubjectsForm: React.FC<SubjectsFormProps> = ({ selectedSubject }) => {
    const { school, updateSubjects } = useMainContext();
    
    const [formData, setFormData] = useState<SubjectRequest>({
        name: selectedSubject ? selectedSubject.name : "",
        schoolId: selectedSubject ? selectedSubject.schoolId : school?.id || "",
    });

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

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
        e.preventDefault();
        setIsLoading(true);
        setError("");
        setSuccessMessage("");

        try {
            if (!formData.schoolId) {
                setError(messages.school.idRequired);
                setIsLoading(false);
                return;
            }

            const response = await addSubjectAction(formData);

            if (response.success && response.data) {
                updateSubjects(response.data as SubjectType);
                
                setSuccessMessage(response.message);
                
                setFormData({
                    name: "",
                    schoolId: school?.id || "",
                });
            } else {
                setError(response.message);
            }
        } catch (err) {
            setError(messages.subjects.createError);
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Form
            handleSubmit={handleSubmit}
            isLoading={isLoading}
            error={error}
            success={successMessage}
            loadingText="מוסיף מקצוע..."
            btnText="הוסף מקצוע"
        >
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
