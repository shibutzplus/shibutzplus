"use client";

import React, { useEffect, useState } from "react";
import styles from "./ClassesForm.module.css";
import { ClassType, ClassRequest } from "@/models/types/classes";
import InputText from "../ui/InputText/InputText";
import Form from "../core/Form/Form";
import { useSession } from "next-auth/react";

type ClassesFormProps = {
    setClasses: React.Dispatch<React.SetStateAction<ClassType[]>>;
    selectedClass: ClassType | null;
};

const ClassesForm: React.FC<ClassesFormProps> = ({ setClasses, selectedClass }) => {
    const { data: session } = useSession();
    const [formData, setFormData] = useState<ClassRequest>({
        name: selectedClass ? selectedClass.name : "",
        schoolId: selectedClass ? selectedClass.schoolId : session?.user?.id || "school1",
    });

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (selectedClass) {
            setFormData({
                name: selectedClass.name,
                schoolId: selectedClass.schoolId,
            });
        } else {
            setFormData({
                name: "",
                schoolId: session?.user?.id || "school1",
            });
        }
    }, [selectedClass, session]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            const newClass: ClassType = {
                id: Date.now().toString(),
                name: formData.name,
                schoolId: formData.schoolId,
            };

            setClasses((prev) => [...prev, newClass]);

            // add class to the DB

            // Reset form
            setFormData({
                name: "",
                schoolId: session?.user?.id || "school1",
            });
        } catch (err) {
            setError("אירעה שגיאה בהוספת הכיתה. אנא נסה שוב.");
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
            loadingText="מוסיף כיתה..."
            btnText="הוסף כיתה"
        >
            {[
                <InputText
                    key="name"
                    label="שם כיתה"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        setFormData((prev) => ({
                            ...prev,
                            [e.target.name]: e.target.value,
                        }));
                    }}
                    placeholder="לדוגמה: א1"
                    required
                />
            ]}
        </Form>
    );
};

export default ClassesForm;
