"use client";

import React, { useState } from "react";
import styles from "./TeachersForm.module.css";
import { Teacher, TeacherRequest, TeacherRole } from "@/models/types/teachers";
import InputText from "../ui/InputText/InputText";
import InputSelect from "../ui/InputSelect/InputSelect";
import SubmitBtn from "../ui/SubmitBtn/SubmitBtn";
import InputTextArea from "../ui/InputTextArea/InputTextArea";
import RadioGroup from "../ui/RadioGroup/RadioGroup";

type TeachersFormProps = {
    setTeachers: React.Dispatch<React.SetStateAction<Teacher[]>>;
};

const TeachersForm: React.FC<TeachersFormProps> = ({ setTeachers }) => {
    const [formData, setFormData] = useState<TeacherRequest>({
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
                <InputText
                    label="שם"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="הזינו שם"
                    required
                />

                <InputSelect
                    label="מקצוע"
                    id="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    options={[
                        { value: "math", label: "חשבון" },
                        { value: "hebrew", label: "עברית" },
                        { value: "english", label: "אנגלית" },
                        { value: "sports", label: "ספורט" },
                    ]}
                />

                <RadioGroup
                    label="תפקיד"
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    options={[
                        { value: "מורה קיים", label: "מורה קיים" },
                        { value: "מורה מחליף", label: "מורה מחליף" },
                    ]}
                />

                <InputText
                    label="כיתות"
                    id="classes"
                    name="classes"
                    value={formData.classes}
                    onChange={handleChange}
                    placeholder="לדוגמה: א1, ב2, ג3"
                    required
                />

                <InputTextArea
                    label="מידע כללי"
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    placeholder="הערות או מידע נוסף על המורה"
                />

                <div className={styles.formActions}>
                    <SubmitBtn
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
