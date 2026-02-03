"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DynamicInputSelect from "@/components/ui/select/InputSelect/DynamicInputSelect";
import SubmitBtn from "@/components/ui/buttons/SubmitBtn/SubmitBtn";
import PWAInstall from "@/components/pwa/PWAInstall/PWAInstall";
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
    isLogout?: boolean;
};

const TeacherAuthForm: React.FC<TeacherAuthFormProps> = ({
    schoolId,
    teachers,
    teachersFull,
    isLoadingTeachers,
    isLogout = false,
}) => {
    const route = useRouter();
    const [selectedTeacher, setSelectedTeacher] = useState<string>("");
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>("");
    const [isQuickLogin, setIsQuickLogin] = useState<boolean>(false);
    const [storedTeacherName, setStoredTeacherName] = useState<string>("");

    // Preselect teacher from localStorage if present and matches current school
    useEffect(() => {
        if (isLoadingTeachers) return;
        const stored = getStorageTeacher();
        if (!stored) return;
        if (schoolId && stored.schoolId !== schoolId) return;

        setSelectedTeacher(stored.id);
        setStoredTeacherName(stored.name || "");

        // Only show Quick Login if this is a logout scenario
        if (isLogout) {
            setIsQuickLogin(true);
        }
    }, [isLoadingTeachers, schoolId, teachers, isLogout]);

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
                {isQuickLogin ? (
                    <div className={styles.quickLoginInfo}>
                        <p className={styles.welcomeText}>שלום <strong>{storedTeacherName}</strong></p>
                    </div>
                ) : (
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
                    disabled={isQuickLogin ? false : (isLoadingTeachers || !selectedTeacher)}
                    width="80%"
                />

                <div className={styles.pwaInstallWrapper}>
                    <PWAInstall />
                </div>
            </form>
        </div>
    );
};

export default TeacherAuthForm;
