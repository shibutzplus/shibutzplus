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
import { useMainContext } from "@/context/MainContext";
import { addTeacherAction } from "@/app/actions/addTeacherAction";
import messages from "@/resources/messages";

type TeachersFormProps = {
    setTeachers: React.Dispatch<React.SetStateAction<TeacherType[]>>;
    selectedTeacher: TeacherType | null;
};

const TeachersForm: React.FC<TeachersFormProps> = ({ setTeachers, selectedTeacher }) => {
    const { data: session } = useSession();
    const { school, updateTeachers } = useMainContext();
    const [formData, setFormData] = useState<TeacherRequest>({
        name: selectedTeacher ? selectedTeacher.name : "",
        role: selectedTeacher ? selectedTeacher.role : TeacherRoleValues.HOMEROOM,
        schoolId: selectedTeacher ? selectedTeacher.schoolId : school?.id || "",
        userId: selectedTeacher ? selectedTeacher.userId : null,
    });

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    useEffect(() => {
        if (selectedTeacher) {
            setFormData({
                name: selectedTeacher.name,
                role: selectedTeacher.role,
                schoolId: selectedTeacher.schoolId,
                userId: selectedTeacher.userId,
            });
        } else if (school) {
            // Default to current school from context
            setFormData({
                name: "",
                role: TeacherRoleValues.HOMEROOM,
                schoolId: school.id,
                userId: null,
            });
        }
    }, [selectedTeacher, school]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");
        setSuccessMessage("");

        try {
            const result = await addTeacherAction(formData);

            if (result.success && result.data) {

                setTeachers((prev) => [...prev, result.data!]);
                
                // Update global context and localStorage cache
                updateTeachers(result.data);
                
                // Show success message
                setSuccessMessage(result.message);
                
                // Reset form
                setFormData({
                    name: "",
                    role: TeacherRoleValues.HOMEROOM,
                    schoolId: school?.id || "",
                    userId: null,
                });
            } else {
                setError(result.message);
            }
        } catch (err) {
            setError(messages.teachers.createError);
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
