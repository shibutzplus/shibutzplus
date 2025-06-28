"use client";

import React, { useEffect, useState } from "react";
import {
    TeacherType,
    TeacherRequest,
    TeacherRole,
    TeacherRoleValues,
} from "@/models/types/teachers";
import RadioGroup from "../ui/RadioGroup/RadioGroup";
import Form from "../core/Form/Form";
import InputText from "../ui/InputText/InputText";
import { useMainContext } from "@/context/MainContext";
import messages from "@/resources/messages";
import styles from "./TeachersForm.module.css";
import SubmitBtn from "../ui/SubmitBtn/SubmitBtn";
import { errorToast, successToast } from "@/lib/toast";

type TeachersFormProps = {
    selectedTeacher: TeacherType | null;
};

const TeachersForm: React.FC<TeachersFormProps> = ({ selectedTeacher }) => {
    const { school, addNewTeacher, updateTeacher } = useMainContext();
    const [formData, setFormData] = useState<TeacherRequest>({
        name: selectedTeacher ? selectedTeacher.name : "",
        role: selectedTeacher ? selectedTeacher.role : TeacherRoleValues.REGULAR,
        schoolId: selectedTeacher ? selectedTeacher.schoolId : school?.id || "",
        userId: selectedTeacher ? selectedTeacher.userId : null,
    });

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>("");

    // const { handleSubmitAdd, isLoading } = useSubmit<TeacherRequest>(
    //     setFormData,
    //     messages.teachers.createSuccess,
    //     messages.teachers.createError,
    //     messages.teachers.invalid,
    // );

    useEffect(() => {
        if (selectedTeacher) {
            setFormData({
                name: selectedTeacher.name,
                role: selectedTeacher.role,
                schoolId: selectedTeacher.schoolId,
                userId: selectedTeacher.userId,
            });
        } else if (school) {
            setFormData({
                name: "",
                role: TeacherRoleValues.REGULAR,
                schoolId: school.id,
                userId: null,
            });
        }
    }, [selectedTeacher, school]);

    const handleSubmitAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            for (const key in formData) {
                // check if any of values is empty
                if (formData[key as keyof TeacherRequest] === "") {
                    setError(messages.teachers.invalid);
                    setIsLoading(false);
                    return;
                }
            }

            const res = await addNewTeacher(formData);
            successToast(res ? messages.teachers.createSuccess : messages.teachers.createError);
            const updatedFormData = {
                ...formData,
                name: "",
                schoolId: formData.schoolId,
            };
            setFormData(updatedFormData);
        } catch (error) {
            console.error(error);
            errorToast(messages.teachers.createError);
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            if (!selectedTeacher?.id) {
                setError("No teacher selected for update");
                setIsLoading(false);
                return;
            }

            for (const key in formData) {
                // check if any of values is empty
                if (formData[key as keyof TeacherRequest] === "") {
                    setError(messages.teachers.invalid);
                    setIsLoading(false);
                    return;
                }
            }

            const res = await updateTeacher(selectedTeacher.id, formData);
            successToast(res ? messages.teachers.updateSuccess : messages.teachers.updateError);
            const updatedFormData = {
                ...formData,
                name: "",
                schoolId: formData.schoolId,
            };
            setFormData(updatedFormData);
        } catch (error) {
            console.error(error);
            errorToast(messages.teachers.updateError);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Form handleSubmit={handleSubmitAdd} isLoading={isLoading}>
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
                name="role"
                value={formData.role}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setFormData((prev) => ({
                        ...prev,
                        role: e.target.value as TeacherRole,
                    }));
                }}
                options={[
                    { value: TeacherRoleValues.REGULAR, label: "מן המניין" },
                    { value: TeacherRoleValues.SUBSTITUTE, label: "מורה מחליף/ה" },
                ]}
            />
            <div className={styles.formActions}>
                <SubmitBtn type="submit" isLoading={isLoading} buttonText="הוספה" />
                <button
                    type="button"
                    onClick={handleUpdate}
                    className={styles.updateButton}
                    disabled={!selectedTeacher}
                >
                    עדכון
                </button>
            </div>
        </Form>
    );
};

export default TeachersForm;
