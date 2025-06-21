"use client";

import React, { useEffect, useState } from "react";
import styles from "./SubjectsForm.module.css";
import InputText from "../ui/InputText/InputText";
import Form from "../core/Form/Form";
import { SubjectRequest, SubjectType } from "@/models/types/subjects";

type SubjectsFormProps = {
    setSubjects: React.Dispatch<React.SetStateAction<SubjectType[]>>;
    selectedSubject: SubjectType | null;
};

const SubjectsForm: React.FC<SubjectsFormProps> = ({ setSubjects, selectedSubject }) => {
    const [formData, setFormData] = useState<SubjectRequest>({
        name: selectedSubject ? selectedSubject.name : "",
        schoolId: selectedSubject ? selectedSubject.schoolId : "",
    });

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (selectedSubject) {
            setFormData({
                name: selectedSubject.name,
                schoolId: selectedSubject.schoolId,
            });
        }
    }, [selectedSubject]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            const newSubject: SubjectType = {
                id: Date.now().toString(),
                name: formData.name,
                schoolId: formData.schoolId,
            };

            setSubjects((prev) => [...prev, newSubject]);

            // add profession to the DB

            // Reset form
            setFormData({
                name: "",
                schoolId: "",
            });
        } catch (err) {
            setError("אירעה שגיאה בהוספת המקצוע. אנא נסה שוב.");
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
