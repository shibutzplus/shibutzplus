"use client";

import React, { useEffect, useState } from "react";
import styles from "./SubjectsForm.module.css";
import { SubjectType, SubjectRequest } from "@/models/types/subjects";
import Form from "../core/Form/Form";
import { useSession } from "next-auth/react";
import InputText from "../ui/InputText/InputText";
import { useMainContext } from "@/context/MainContext";
import { addSubjectAction } from "@/app/actions/addSubjectAction";
import messages from "@/resources/messages";

type SubjectsFormProps = {
    setSubjects: React.Dispatch<React.SetStateAction<SubjectType[]>>;
    selectedSubject: SubjectType | null;
};

const SubjectsForm: React.FC<SubjectsFormProps> = ({ setSubjects, selectedSubject }) => {
    const { data: session } = useSession();
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
            // Call the server action to add the subject
            const result = await addSubjectAction(formData);

            if (result.success && result.data) {
                // Update local component state
                setSubjects((prev) => [...prev, result.data!]);
                
                // Update global context and localStorage cache
                updateSubjects(result.data);
                
                // Show success message
                setSuccessMessage(result.message);
                
                // Reset form
                setFormData({
                    name: "",
                    schoolId: school?.id || "",
                });
            } else {
                setError(result.message);
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
