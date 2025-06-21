"use client";

import React, { useEffect, useState } from "react";
import styles from "./TeachersForm.module.css";
import {
    TeacherType,
    TeacherRequest,
    TeacherRole,
    TeacherRoleValues,
} from "@/models/types/teachers";
import RadioGroup from "../ui/RadioGroup/RadioGroup";
import Form from "../core/Form/Form";
import { useSession } from "next-auth/react";
import InputText from "../ui/InputText/InputText";

type TeachersFormProps = {
    setTeachers: React.Dispatch<React.SetStateAction<TeacherType[]>>;
    selectedTeacher: TeacherType | null;
};

const TeachersForm: React.FC<TeachersFormProps> = ({ setTeachers, selectedTeacher }) => {
    const { data: session } = useSession();
    const [formData, setFormData] = useState<TeacherRequest>({
        name: selectedTeacher ? selectedTeacher.name : "",
        role: selectedTeacher ? selectedTeacher.role : TeacherRoleValues.HOMEROOM,
        schoolId: selectedTeacher ? selectedTeacher.schoolId : session?.user?.id || "school1",
        userId: selectedTeacher ? selectedTeacher.userId : null,
    });

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (selectedTeacher) {
            setFormData({
                name: selectedTeacher.name,
                role: selectedTeacher.role,
                schoolId: selectedTeacher.schoolId,
                userId: selectedTeacher.userId,
            });
        } else {
            // Default to current school from session
            const schoolId = session?.user?.id || "school1"; // Default for demo
            setFormData({
                name: "",
                role: TeacherRoleValues.HOMEROOM,
                schoolId: schoolId,
                userId: null,
            });
        }
    }, [selectedTeacher, session]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            const newTeacher: TeacherType = {
                id: Date.now().toString(),
                name: formData.name,
                role: formData.role,
                schoolId: formData.schoolId,
                userId: formData.userId,
            };

            setTeachers((prev) => [...prev, newTeacher]);

            // add teacher to the DB

            // Reset form
            setFormData({
                name: "",
                role: TeacherRoleValues.HOMEROOM,
                schoolId: session?.user?.id || "school1",
                userId: null,
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
                name="name"
                value={formData.name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setFormData((prev) => ({
                        ...prev,
                        name: e.target.value,
                    }));
                }}
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
                    { value: TeacherRoleValues.HOMEROOM, label: "מחנך/ת כיתה" },
                    { value: TeacherRoleValues.SUBSTITUTE, label: "מורה מחליף/ה" },
                ]}
            />
        </Form>
    );
};

export default TeachersForm;
