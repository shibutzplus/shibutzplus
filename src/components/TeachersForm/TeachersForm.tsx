"use client";

import React, { useEffect, useState } from "react";
import styles from "./TeachersForm.module.css";
import { Teacher, TeacherRequest, TeacherRole } from "@/models/types/teachers";
import InputText from "../ui/InputText/InputText";
import RadioGroup from "../ui/RadioGroup/RadioGroup";
import Form from "../core/Form/Form";

type TeachersFormProps = {
    setTeachers: React.Dispatch<React.SetStateAction<Teacher[]>>;
    selectedTeacher: Teacher | null;
};

const TeachersForm: React.FC<TeachersFormProps> = ({ setTeachers, selectedTeacher }) => {
    const [formData, setFormData] = useState<TeacherRequest>({
        name: selectedTeacher ? selectedTeacher.name : "",
        role: selectedTeacher ? selectedTeacher.role : "מורה קיים",
        primaryClass: selectedTeacher ? selectedTeacher.primaryClass : "",
    });

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (selectedTeacher) {
            setFormData({
                name: selectedTeacher.name,
                role: selectedTeacher.role,
                primaryClass: selectedTeacher.primaryClass,
            });
        }
    }, [selectedTeacher]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            const newTeacher: Teacher = {
                id: Date.now().toString(),
                name: formData.name,
                role: formData.role as TeacherRole,
                primaryClass: formData.primaryClass,
            };

            setTeachers((prev) => [...prev, newTeacher]);

            // add teacher to the DB

            // Reset form
            setFormData({
                name: "",
                role: "מורה קיים",
                primaryClass: "",
            });
        } catch (err) {
            setError("אירעה שגיאה בהוספת המורה. אנא נסה שוב.");
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
            loadingText="מוסיף מורה..."
            btnText="הוסף מורה"
        >
            <InputText
                label="שם"
                id="name"
                name="name"
                value={formData.name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setFormData((prev) => ({
                        ...prev,
                        [e.target.name]: e.target.value,
                    }));
                }}
                placeholder="הזינו שם"
                required
            />

            <InputText
                label="כיתה ראשית"
                id="primaryClass"
                name="primaryClass"
                value={formData.primaryClass}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setFormData((prev) => ({
                        ...prev,
                        primaryClass: e.target.value,
                    }));
                }}
                placeholder="לדוגמה: א1"
                required
            />

            <RadioGroup
                label="תפקיד"
                name="role"
                value={formData.role}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setFormData((prev) => ({
                        ...prev,
                        role: e.target.value as TeacherRole,
                    }));
                }}
                options={[
                    { value: "מורה קיים", label: "מורה קיים" },
                    { value: "מורה מחליף", label: "מורה מחליף" },
                ]}
            />
        </Form>
    );
};

export default TeachersForm;
