"use client";

import React, { useEffect, useState } from "react";
import { ClassType, ClassRequest } from "@/models/types/classes";
import InputText from "../ui/InputText/InputText";
import Form from "../core/Form/Form";
import { useMainContext } from "@/context/MainContext";
import messages from "@/resources/messages";
import styles from "./ClassesForm.module.css";
import SubmitBtn from "../ui/SubmitBtn/SubmitBtn";
import { errorToast, successToast } from "@/lib/toast";
import { classSchema } from "@/models/validation/class";

type ClassesFormProps = {
    selectedClass: ClassType | null;
};

const ClassesForm: React.FC<ClassesFormProps> = ({ selectedClass }) => {
    const { school, addNewClass, updateClass } = useMainContext();
    const [formData, setFormData] = useState<ClassRequest>({
        name: selectedClass ? selectedClass.name : "",
        schoolId: selectedClass ? selectedClass.schoolId : school?.id || "",
    });
    
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>("");
    const [validationErrors, setValidationErrors] = useState<{
        name?: string;
        schoolId?: string;
    }>({});

    useEffect(() => {
        if (selectedClass) {
            setFormData({
                name: selectedClass.name,
                schoolId: selectedClass.schoolId,
            });
        } else if (school) {
            setFormData({
                name: "",
                schoolId: school?.id || "",
            });
        }
    }, [selectedClass, school]);

    const handleSubmitAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");
        setValidationErrors({});

        try {
            const validationResult = classSchema.safeParse(formData);

            if (!validationResult.success) {
                const fieldErrors: { name?: string; schoolId?: string } = {};
                validationResult.error.issues.forEach((issue) => {
                    const field = issue.path[0] as keyof typeof fieldErrors;
                    if (field === 'name' || field === 'schoolId') {
                        fieldErrors[field] = issue.message;
                    }
                });
                setValidationErrors(fieldErrors);
                setIsLoading(false);
                return;
            }

            const res = await addNewClass(formData);
            successToast(res ? messages.classes.createSuccess : messages.classes.createError);
            setFormData({
                ...formData,
                name: "",
            });
        } catch (error) {
            console.error(error);
            errorToast(messages.classes.createError);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");
        setValidationErrors({});

        try {
            if (!selectedClass?.id) {
                setError("No class selected for update");
                setIsLoading(false);
                return;
            }

            const validationResult = classSchema.safeParse(formData);

            if (!validationResult.success) {
                const fieldErrors: { name?: string; schoolId?: string } = {};
                validationResult.error.issues.forEach((issue) => {
                    const field = issue.path[0] as keyof typeof fieldErrors;
                    if (field === 'name' || field === 'schoolId') {
                        fieldErrors[field] = issue.message;
                    }
                });
                setValidationErrors(fieldErrors);
                setIsLoading(false);
                return;
            }

            const res = await updateClass(selectedClass.id, formData);
            successToast(res ? messages.classes.updateSuccess : messages.classes.updateError);
            setFormData({
                ...formData,
                name: "",
                schoolId: formData.schoolId,
            });
        } catch (error) {
            console.error(error);
            errorToast(messages.classes.updateError);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Form handleSubmit={handleSubmitAdd} isLoading={isLoading}>
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
                placeholder="כיתה א1 - שם המחנך"
                error={validationErrors.name}
                required
            />
            <div className={styles.formActions}>
                <SubmitBtn type="submit" isLoading={isLoading} buttonText="הוספה" />
                <button
                    type="button"
                    onClick={handleUpdate}
                    className={styles.updateButton}
                    disabled={!selectedClass}
                >
                    עדכון
                </button>
            </div>
        </Form>
    );
};

export default ClassesForm;
