"use client";

import React, { Dispatch, SetStateAction, useState } from "react";
import { useRouter } from "next/navigation";
import DynamicInputSelect from "@/components/ui/select/InputSelect/DynamicInputSelect";
import SubmitBtn from "@/components/ui/buttons/SubmitBtn/SubmitBtn";
import styles from "./TeacherAuthForm.module.css";
import { SelectOption } from "@/models/types";
import router from "@/routes";
import messages from "@/resources/messages";
import { setTeacherCookie } from "@/utils/cookies";

type TeacherAuthFormProps = {
    schoolId: string;
    teachers: SelectOption[];
    isLoadingTeachers: boolean;
};

const TeacherAuthForm: React.FC<TeacherAuthFormProps> = ({ schoolId, teachers, isLoadingTeachers }) => {
    const route = useRouter();
    const [selectedTeacher, setSelectedTeacher] = useState<string>("");
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        if (!selectedTeacher) {
            setError(messages.teachers.needToSelect);
            setIsLoading(false);
            return;
        }

        setError("");
        setTeacherCookie(selectedTeacher);
        route.push(`${router.teacherPortal.p}/${schoolId}/${selectedTeacher}`);
    };

    return (
        <div className={styles.formContainer}>
            <form className={styles.form} onSubmit={handleSubmit}>
                <div className={styles.inputGroup}>
                    <DynamicInputSelect
                        id="teacher"
                        options={teachers}
                        value={selectedTeacher}
                        onChange={setSelectedTeacher}
                        placeholder={
                            isLoadingTeachers
                                ? "טוען רשימת מורים..."
                                : "בחרו את שמכם כדי שנוכל להמשיך"
                        }
                        isSearchable={true}
                        isDisabled={isLoadingTeachers}
                        hasBorder
                    />
                </div>
                <SubmitBtn
                    type="submit"
                    buttonText="כניסה"
                    error={error}
                    isLoading={isLoading}
                    disabled={isLoadingTeachers || !selectedTeacher}
                />
            </form>
        </div>
    );
};

export default TeacherAuthForm;
