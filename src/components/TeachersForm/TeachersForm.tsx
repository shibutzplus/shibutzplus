"use client";

import React, { useState } from "react";
import styles from "./TeachersForm.module.css";
import { Teacher, TeacherFormData, TeacherRole } from "@/models/types/teachers";
import AuthInputText from "../ui/AuthInputText/AuthInputText";
import AuthSelect from "../ui/AuthSelect/AuthSelect";
import AuthBtn from "../ui/AuthBtn/AuthBtn";

type TeachersFormProps = {
    setTeachers: React.Dispatch<React.SetStateAction<Teacher[]>>;
};

const TeachersForm: React.FC<TeachersFormProps> = ({ setTeachers }) => {
    const [formData, setFormData] = useState<TeacherFormData>({
        firstName: "",
        lastName: "",
        role: "מורה קיים",
        classes: "",
    });

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            const newTeacher: Teacher = {
                id: Date.now().toString(),
                firstName: formData.firstName,
                lastName: formData.lastName,
                role: formData.role as TeacherRole,
                classes: formData.classes.split(",").map((cls) => cls.trim()),
            };

            setTeachers((prev) => [...prev, newTeacher]);

            // Reset form
            setFormData({
                firstName: "",
                lastName: "",
                role: "מורה קיים",
                classes: "",
            });
        } catch (err) {
            setError("אירעה שגיאה בהוספת המורה. אנא נסה שוב.");
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    return (
        <section className={styles.formSection}>
            <h2 className={styles.formTitle}>הוספת מורה חדש</h2>
            <p className={styles.formSubtitle}>הזינו פרטי המורה החדש</p>

            <form onSubmit={handleSubmit} className={styles.addTeacherForm}>
                <AuthInputText
                    label="שם פרטי"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="הזינו שם פרטי"
                    required
                />

                <AuthInputText
                    label="שם משפחה"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="הזינו שם משפחה"
                    required
                />

                <AuthSelect
                    label="תפקיד"
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    options={[
                        { value: "מורה קיים", label: "מורה קיים" },
                        { value: "מורה מחליף", label: "מורה מחליף" },
                    ]}
                    required
                />

                <AuthInputText
                    label="כיתות"
                    id="classes"
                    name="classes"
                    value={formData.classes}
                    onChange={handleChange}
                    placeholder="לדוגמה: א1, ב2, ג3"
                    required
                />

                <div className={styles.formActions}>
                    <AuthBtn
                        type="submit"
                        isLoading={isLoading}
                        loadingText="מוסיף מורה..."
                        buttonText="הוסף מורה"
                        error={error}
                    />
                </div>
            </form>
        </section>
    );
};

export default TeachersForm;
