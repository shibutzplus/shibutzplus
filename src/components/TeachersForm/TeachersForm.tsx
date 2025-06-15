"use client";

import React, { useState } from "react";
import styles from "./TeachersForm.module.css";
import { Teacher, TeacherFormData, TeacherRole } from "@/models/types/teachers";
import AuthInputText from "../ui/AuthInputText/AuthInputText";
import AuthSelect from "../ui/AuthSelect/AuthSelect";
import AuthBtn from "../ui/AuthBtn/AuthBtn";
import AuthTextArea from "../ui/AuthTextArea/AuthTextArea";
import AuthRadioGroup from "../ui/AuthRadioGroup/AuthRadioGroup";

type TeachersFormProps = {
    setTeachers: React.Dispatch<React.SetStateAction<Teacher[]>>;
};

const TeachersForm: React.FC<TeachersFormProps> = ({ setTeachers }) => {
    const [formData, setFormData] = useState<TeacherFormData>({
        name: "",
        role: "מורה קיים",
        subject: "",
        classes: "",
        notes: "",
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
                name: formData.name,
                role: formData.role as TeacherRole,
                subject: formData.subject,
                classes: formData.classes.split(",").map((cls) => cls.trim()),
                notes: formData.notes,
            };

            setTeachers((prev) => [...prev, newTeacher]);

            // Reset form
            setFormData({
                name: "",
                role: "מורה קיים",
                subject: "",
                classes: "",
                notes: "",
            });
        } catch (err) {
            setError("אירעה שגיאה בהוספת המורה. אנא נסה שוב.");
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    return (
        <section className={styles.formSection}>
            <h2 className={styles.formTitle}>הוספת מורה חדש</h2>

            <form onSubmit={handleSubmit} className={styles.addTeacherForm}>
                <AuthInputText
                    label="שם"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="הזינו שם"
                    required
                />

                <AuthSelect
                    label="מקצוע"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    options={[
                        { value: "math", label: "חשבון" },
                        { value: "hebrew", label: "עברית" },
                        { value: "english", label: "אנגלית" },
                        { value: "sports", label: "ספורט" },
                    ]}
                />

                <AuthRadioGroup
                    label="תפקיד"
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    options={[
                        { value: "מורה קיים", label: "מורה קיים" },
                        { value: "מורה מחליף", label: "מורה מחליף" },
                    ]}
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

                <AuthTextArea
                    label="מידע כללי"
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    placeholder="הערות או מידע נוסף על המורה"
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
