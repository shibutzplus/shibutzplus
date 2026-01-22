"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DynamicInputSelect from "@/components/ui/select/InputSelect/DynamicInputSelect";
import SubmitBtn from "@/components/ui/buttons/SubmitBtn/SubmitBtn";
import { SelectOption } from "@/models/types";
import { getStorageTeacher, setStorageTeacher } from "@/lib/localStorage";
import { TeacherRoleValues, TeacherType } from "@/models/types/teachers";
import router from "@/routes";
import messages from "@/resources/messages";
import styles from "./TeacherAuthForm.module.css";

type TeacherAuthFormProps = {
    schoolId: string | undefined;
    teachers: SelectOption[];
    teachersFull: TeacherType[];
    isLoadingTeachers: boolean;
};

const TeacherAuthForm: React.FC<TeacherAuthFormProps> = ({
    schoolId,
    teachers,
    teachersFull,
    isLoadingTeachers,
}) => {
    const route = useRouter();
    const [selectedTeacher, setSelectedTeacher] = useState<string>("");
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>("");
    const [useSubstituteQuickLogin, setUseSubstituteQuickLogin] = useState<boolean>(false);

    // Preselect teacher from localStorage if present and matches current school
    useEffect(() => {
        if (isLoadingTeachers) return;
        const stored = getStorageTeacher();
        if (!stored) return;
        if (schoolId && stored.schoolId !== schoolId) return;

        // If substitute → hide regular teachers list
        if (stored.role === TeacherRoleValues.SUBSTITUTE) {
            setSelectedTeacher(stored.id);
            setUseSubstituteQuickLogin(true);
            return;
        }

        // Otherwise, just preselect in the list if exists
        const existsInList = teachers.some(opt => opt.value === stored.id);
        if (existsInList) setSelectedTeacher(stored.id);
    }, [isLoadingTeachers, schoolId, teachers]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!schoolId) return;
        setIsLoading(true);

        if (!selectedTeacher) {
            setError(messages.teachers.needToSelect);
            setIsLoading(false);
            return;
        }

        setError("");

        // Find the full Teacher object and save only safe fields to localStorage
        const fullTeacher = teachersFull.find(t => t.id === selectedTeacher);
        if (fullTeacher) {
            const safeTeacher: TeacherType = {
                id: fullTeacher.id,
                name: fullTeacher.name,
                role: fullTeacher.role,
                schoolId: fullTeacher.schoolId,
            };
            setStorageTeacher(safeTeacher);
        }

        if (fullTeacher?.role === TeacherRoleValues.STAFF) {
            route.push(router.scheduleViewPortal.p);
            return;
        }

        route.push(`${router.teacherMaterialPortal.p}/${schoolId}/${selectedTeacher}`);
    };

    return (
        <div className={styles.formContainer}>
            <form className={styles.form} onSubmit={handleSubmit}>
                {!useSubstituteQuickLogin && (
                    <div className={styles.inputGroup}>
                        <DynamicInputSelect
                            id="teacher"
                            options={teachers}
                            value={selectedTeacher}
                            onChange={setSelectedTeacher}
                            placeholder={isLoadingTeachers ? "טוען רשימת מורים..." : "בחרו את שמכם"}
                            isSearchable={true}
                            isDisabled={isLoadingTeachers}
                            hasBorder
                        />
                        {isLoadingTeachers && <span className={styles.inlineLoader} aria-label="Loading" />}
                    </div>
                )}

                <SubmitBtn
                    type="submit"
                    buttonText="כניסה"
                    error={error}
                    isLoading={isLoading}
                    disabled={useSubstituteQuickLogin ? false : (isLoadingTeachers || !selectedTeacher)}
                />
            </form>
        </div>
    );
};

export default TeacherAuthForm;
