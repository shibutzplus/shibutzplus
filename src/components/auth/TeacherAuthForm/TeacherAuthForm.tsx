"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DynamicInputSelect from "@/components/ui/InputSelect/InputSelect";
import SubmitBtn from "@/components/ui/buttons/SubmitBtn/SubmitBtn";
import styles from "./TeacherAuthForm.module.css";
import { SelectOption } from "@/models/types";
import { getAllTeachersAction } from "@/app/actions/GET/getAllTeachersAction";
import router from "@/routes";
import messages from "@/resources/messages";
import { getTeacherCookie } from "@/utils/cookies";

const TeacherAuthForm: React.FC = () => {
    const route = useRouter();
    const [selectedTeacher, setSelectedTeacher] = useState("");
    const [teachers, setTeachers] = useState<SelectOption[]>([]);
    const [error, setError] = useState<string>("");
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingTeachers, setIsLoadingTeachers] = useState(true);

    useEffect(() => {
        // Check for remembered teacher first
        const rememberedTeacherId = getTeacherCookie()
        if (rememberedTeacherId) {
            route.push(`${router.teacherPortal.p}/${rememberedTeacherId}`);
            return;
        }

        const fetchTeachers = async () => {
            try {
                const response = await getAllTeachersAction();
                if (response.success && response.data) {
                    const teacherOptions: SelectOption[] = response.data.map((teacher) => ({
                        value: teacher.id,
                        label: teacher.name,
                    }));
                    setTeachers(teacherOptions);
                } else {
                    setError(messages.teachers.error);
                }
            } catch (error) {
                console.error("Error fetching teachers:", error);
                setError(messages.teachers.error);
            } finally {
                setIsLoadingTeachers(false);
            }
        };

        fetchTeachers();
    }, [route]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        if (!selectedTeacher) {
            setError(messages.teachers.needToSelect);
            setIsLoading(false);
            return;
        }
        
        // setTeacherCookie(selectedTeacher);
        route.push(`${router.teacherPortal.p}/${selectedTeacher}`);
        setIsLoading(false);
    };

    return (
        <div className={styles.formContainer}>
            <form className={styles.form} onSubmit={handleSubmit}>
                <div className={styles.inputGroup}>
                    <DynamicInputSelect
                        label="שלום, נא לבחור את שמך מהרשימה:"
                        id="teacher"
                        options={teachers}
                        value={selectedTeacher}
                        onChange={setSelectedTeacher}
                        placeholder={isLoadingTeachers ? "טוען רשימת מורים..." : "מהו שמך?"}
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
