"use client";

import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useRef } from "react";
import { usePortal } from "@/context/PortalContext";
import PortalTable from "@/components/teacherPortalTable/PortalTable/PortalTable";
import styles from "./teacherPortal.module.css";
import router from "@/routes";
import TeacherPortalSkeleton from "@/components/layout/skeleton/TeacherPortalSkeleton/TeacherPortalSkeleton";
import { NextPage } from "next";
import { errorToast } from "@/lib/toast";

const TeacherPortalPage: NextPage = () => {
    const params = useParams();
    const route = useRouter();
    const schoolId = params.schoolId as string | undefined;
    const teacherId = params.teacherId as string | undefined;
    const { teacher, setTeacherAndSchool, fetchPortalScheduleDate, isPortalLoading, selectedDate } =
        usePortal();

    if (!schoolId) route.push(`${router.teacherSignIn.p}`);
    if (!teacherId) route.push(`${router.teacherSignIn.p}/${schoolId}`);

    useEffect(() => {
        const setTeacher = async () => {
            const response = await setTeacherAndSchool(schoolId, teacherId);
            if (!response) route.push(`${router.teacherSignIn.p}/${schoolId}`);
        };
        if (!teacher) setTeacher();
    }, [teacherId, schoolId]);

    const blockRef = useRef<boolean>(true);
    useEffect(() => {
        const fetchData = async () => {
            if (blockRef.current) {
                const response = await fetchPortalScheduleDate();
                if (response.success) blockRef.current = false;
                else if (response.error !== "") {
                    errorToast(response.error);
                }
            }
        };
        fetchData();
    }, [selectedDate, teacher]);

    if (isPortalLoading) return <TeacherPortalSkeleton />;

    return (
        <section className={styles.content}>
            <div className={styles.whiteBox}>
                <PortalTable />
            </div>
        </section>
    );
};

export default TeacherPortalPage;
