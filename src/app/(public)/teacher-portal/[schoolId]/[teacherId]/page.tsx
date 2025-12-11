"use client";

import React, { useEffect } from "react";
import { NextPage } from "next";
import styles from "./teacherPortal.module.css";
import { usePortalContext } from "@/context/PortalContext";
import { useParams, useRouter } from "next/navigation";
import router from "@/routes";
import TeacherTable from "@/components/tables/teacherScheduleTable/TeacherTable/TeacherTable";
import { useTeacherTableContext } from "@/context/TeacherTableContext";
import Preloader from "@/components/ui/Preloader/Preloader";

import NotPublished from "@/components/empty/NotPublished/NotPublished";

const TeacherPortalPage: NextPage = () => {
    const { selectedDate, teacher, setTeacherAndSchool, datesOptions, isDatesLoading, settings } = usePortalContext();
    const { fetchTeacherScheduleDate } = useTeacherTableContext();

    const params = useParams();
    const route = useRouter();
    const schoolId = params.schoolId as string | undefined;
    const teacherId = params.teacherId as string | undefined;

    if (!schoolId) route.push(`${router.teacherSignIn.p}`);
    if (!teacherId) route.push(`${router.teacherSignIn.p}/${schoolId}`);

    useEffect(() => {
        const setTeacher = async () => {
            const response = await setTeacherAndSchool(schoolId, teacherId);
            if (!response) route.push(`${router.teacherSignIn.p}/${schoolId}`);
        };
        if (!teacher) setTeacher();
    }, [teacherId, schoolId]);

    const isValidDate = datesOptions.some((d) => d.value === selectedDate);

    useEffect(() => {
        if (isValidDate) {
            fetchTeacherScheduleDate(teacher, selectedDate);
        }
    }, [selectedDate, teacher?.id, schoolId, datesOptions]);

    if (!teacher)
        return (
            <div
                style={{
                    position: "absolute",
                    top: "40%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                }}
            >
                <Preloader />
            </div>
        );

    if (!isValidDate) {
        return (
            <div className={styles.container}>
                <NotPublished date={selectedDate} text="אין שינויים במערכת האישית" />
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <TeacherTable
                teacher={teacher}
                selectedDate={selectedDate}
                hoursNum={settings?.hoursNum}
                fitToSchedule
            />
        </div>
    );
};

export default TeacherPortalPage;
