"use client";

import React, { useEffect, useState } from "react";
import { ClassType, ClassRequest } from "@/models/types/classes";
import InputText from "../ui/InputText/InputText";
import Form from "../core/Form/Form";
import { useMainContext } from "@/context/MainContext";
import { addClassAction } from "@/app/actions/addClassAction";
import messages from "@/resources/messages";

type ClassesFormProps = {
    setClasses: React.Dispatch<React.SetStateAction<ClassType[]>>;
    selectedClass: ClassType | null;
};

const ClassesForm: React.FC<ClassesFormProps> = ({ setClasses, selectedClass }) => {
    const { school, updateClasses } = useMainContext();
    
    const [formData, setFormData] = useState<ClassRequest>({
        name: selectedClass ? selectedClass.name : "",
        schoolId: selectedClass ? selectedClass.schoolId : school?.id || "",
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
                schoolId: school?.id || "",
            });
        }
    }, [selectedClass, school]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            if (!formData.schoolId) {
                setError(messages.school.idRequired);
                setIsLoading(false);
                return;
            }

            const response = await addClassAction(formData);
            
            if (response.success && response.data) {
                setClasses((prev) => [...prev, response.data as ClassType]);
                
                // Update MainContext state and localStorage cache
                updateClasses(response.data as ClassType);
                
                // Reset form
                setFormData({
                    name: "",
                    schoolId: school?.id || "",
                });
            } else {
                setError(response.message || messages.classes.createError);
            }
        } catch (err) {
            setError(messages.classes.createError);
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
