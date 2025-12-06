"use client";

import React, { useEffect } from "react";
import { NextPage } from "next";
import TeacherPortalSkeleton from "@/components/loading/skeleton/TeacherPortalSkeleton/TeacherPortalSkeleton";
import styles from "./teacherPortal.module.css";
import { usePortalContext } from "@/context/PortalContext";
import { useParams, useRouter } from "next/navigation";
import router from "@/routes";
import TeacherTable from "@/components/tables/teacherScheduleTable/TeacherTable/TeacherTable";
import { useTeacherTableContext } from "@/context/TeacherTableContext";

const TeacherPortalPage: NextPage = () => {
    const { selectedDate, teacher, setTeacherAndSchool, isDatesLoading } = usePortalContext();
    const { isPortalLoading, fetchTeacherScheduleDate } = useTeacherTableContext();

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

    useEffect(() => {
        fetchTeacherScheduleDate(teacher, selectedDate);
    }, [selectedDate, teacher?.id, schoolId]);

    if (!teacher || isDatesLoading || isPortalLoading) return <TeacherPortalSkeleton />;

    return (
        <div className={styles.container}>
            <TeacherTable teacher={teacher} selectedDate={selectedDate} />
        </div>
    );
};

export default TeacherPortalPage;
