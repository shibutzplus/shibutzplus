"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DynamicInputSelect from "@/components/ui/InputSelect/InputSelect";
import SubmitBtn from "@/components/ui/SubmitBtn/SubmitBtn";
import styles from "./TeacherAuthForm.module.css";
import { SelectOption } from "@/models/types";
import { getAllTeachersAction } from "@/app/actions/GET/getAllTeachersAction";
import Cookies from "js-cookie";
import router from "@/routes";
import { COOKIES_KEYS } from "@/resources/storage";

const TeacherAuthForm: React.FC = () => {
    const route = useRouter();
    const [selectedTeacher, setSelectedTeacher] = useState("");
    const [teachers, setTeachers] = useState<SelectOption[]>([]);
    const [error, setError] = useState<string>("");
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingTeachers, setIsLoadingTeachers] = useState(true);

    useEffect(() => {
        // Check for remembered teacher first
        const rememberedTeacherId = Cookies.get(COOKIES_KEYS.REMEMBERED_TEACHER);
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
                    setError("שגיאה בטעינת רשימת המורים");
                }
            } catch (error) {
                console.error("Error fetching teachers:", error);
                setError("שגיאה בטעינת רשימת המורים");
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
            setError("יש לבחור מורה מהרשימה");
            setIsLoading(false);
            return;
        }

        // Cookies.set(COOKIES_KEYS.REMEMBERED_TEACHER, selectedTeacher, {
        //     expires: COOKIES_EXPIRE_TIME,
        // });

        route.push(`${router.teacherPortal.p}/${selectedTeacher}`);
        setIsLoading(false);
    };

    return (
        <div className={styles.formContainer}>
            <form className={styles.form}>
                <div className={styles.inputGroup}>
                    <label htmlFor="teacher" className={styles.formLabel}>
                        שלום, נא לבחור את שמך מהרשימה:
                    </label>
                    <DynamicInputSelect
                        id="teacher"
                        label={undefined}
                        options={teachers}
                        value={selectedTeacher}
                        onChange={setSelectedTeacher}
                        placeholder={isLoadingTeachers ? "טוען רשימת מורים..." : "בחירת מורה..."}
                        isSearchable={true}
                        isDisabled={isLoadingTeachers}
                        error={error}
                    />
                </div>
            </form>
        </div>
    );
};

export default TeacherAuthForm;
