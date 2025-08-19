"use client";

import React, { useEffect, useState } from "react";
import { SubjectType, SubjectRequest } from "@/models/types/subjects";
import Form from "../core/Form/Form";
import InputText from "../ui/InputText/InputText";
import { useMainContext } from "@/context/MainContext";
import messages from "@/resources/messages";
import styles from "./SubjectsForm.module.css";
import SubmitBtn from "../ui/SubmitBtn/SubmitBtn";
import { errorToast, successToast } from "@/lib/toast";
import { subjectSchema } from "@/models/validation/subject";

type SubjectsFormProps = {
    selectedSubject: SubjectType | null;
};

const SubjectsForm: React.FC<SubjectsFormProps> = ({ selectedSubject }) => {
    const { school, addNewSubject, updateSubject } = useMainContext();

    const [formData, setFormData] = useState<SubjectRequest>({
        name: selectedSubject ? selectedSubject.name : "",
        schoolId: selectedSubject ? selectedSubject.schoolId : school?.id || "",
    });
    
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>("");
    const [validationErrors, setValidationErrors] = useState<{
        name?: string;
        schoolId?: string;
    }>({});

    useEffect(() => {
        if (selectedSubject) {
            setFormData({
                name: selectedSubject.name,
                schoolId: selectedSubject.schoolId,
            });
        } else if (school) {
            // Default to current school from context
            setFormData({
                name: "",
                schoolId: school.id,
            });
        }
    }, [selectedSubject, school]);

    const handleSubmitAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");
        setValidationErrors({});

        try {
            const validationResult = subjectSchema.safeParse(formData);

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

            const res = await addNewSubject(formData);
            successToast(res ? messages.subjects.createSuccess : messages.subjects.createError);
            setFormData({
                ...formData,
                name: "",
            });
        } catch (error) {
            console.error(error);
            errorToast(messages.subjects.createError);
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
            if (!selectedSubject?.id) {
                setError("No subject selected for update");
                setIsLoading(false);
                return;
            }

            const validationResult = subjectSchema.safeParse(formData);

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

            const res = await updateSubject(selectedSubject.id, formData);
            successToast(res ? messages.subjects.updateSuccess : messages.subjects.updateError);
            setFormData({
                ...formData,
                name: "",
                schoolId: formData.schoolId,
            });
        } catch (error) {
            console.error(error);
            errorToast(messages.subjects.updateError);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Form handleSubmit={handleSubmitAdd} isLoading={isLoading}>
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
                error={validationErrors.name}
                required
            />
            <div className={styles.formActions}>
                <SubmitBtn type="submit" isLoading={isLoading} buttonText="הוספה" />
                <button
                    type="button"
                    onClick={handleUpdate}
                    className={styles.updateButton}
                    disabled={!selectedSubject}
                >
                    עדכון
                </button>
            </div>
        </Form>
    );
};

export default SubjectsForm;
