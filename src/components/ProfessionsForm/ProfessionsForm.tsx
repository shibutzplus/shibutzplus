"use client";

import React, { useEffect, useState } from "react";
import styles from "./ProfessionsForm.module.css";
import { Profession, ProfessionRequest } from "@/models/types/professions";
import InputText from "../ui/InputText/InputText";
import Form from "../core/Form/Form";

type ProfessionsFormProps = {
    setProfessions: React.Dispatch<React.SetStateAction<Profession[]>>;
    selectedProfession: Profession | null;
};

const ProfessionsForm: React.FC<ProfessionsFormProps> = ({ setProfessions, selectedProfession }) => {
    const [formData, setFormData] = useState<ProfessionRequest>({
        name: selectedProfession ? selectedProfession.name : "",
    });

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (selectedProfession) {
            setFormData({
                name: selectedProfession.name,
            });
        }
    }, [selectedProfession]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            const newProfession: Profession = {
                id: Date.now().toString(),
                name: formData.name,
            };

            setProfessions((prev) => [...prev, newProfession]);

            // add profession to the DB

            // Reset form
            setFormData({
                name: "",
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
                />
            ]}
        </Form>
    );
};

export default ProfessionsForm;
