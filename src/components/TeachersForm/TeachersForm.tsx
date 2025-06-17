"use client";

import React, { useState } from "react";
import styles from "./TeachersForm.module.css";
import { Teacher, TeacherRequest, TeacherRole } from "@/models/types/teachers";
import InputText from "../ui/InputText/InputText";
import InputSelect from "../ui/InputSelect/InputSelect";
import SubmitBtn from "../ui/SubmitBtn/SubmitBtn";
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

    return (
        <section className={styles.formSection}>
            <h2 className={styles.formTitle}>הוספת מורה חדש</h2>

            <form onSubmit={handleSubmit} className={styles.addTeacherForm}>
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

                <InputSelect
                    label="מקצוע"
                    id="subject"
                    value={formData.subject}
                    onChange={(value: string) => {
                        setFormData((prev) => ({
                            ...prev,
                            subject: value,
                        }));
                    }}
                    options={[
                        { value: "math", label: "חשבון" },
                        { value: "hebrew", label: "עברית" },
                        { value: "english", label: "אנגלית" },
                        { value: "sports", label: "ספורט" },
                    ]}
                />

                <InputText
                    label="כיתות"
                    id="classes"
                    name="classes"
                    value={formData.classes}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        setFormData((prev) => ({
                            ...prev,
                            classes: e.target.value,
                        }));
                    }}
                    placeholder="לדוגמה: א1, ב2, ג3"
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

                {/* <InputTextArea
                    label="מידע כללי"
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    placeholder="הערות או מידע נוסף על המורה"
                /> */}

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
