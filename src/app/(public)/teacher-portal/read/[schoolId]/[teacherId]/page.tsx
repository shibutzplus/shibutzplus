"use client";

import { useParams, useRouter } from "next/navigation";
import React, { useEffect } from "react";
import { usePortal } from "@/context/PortalContext";
import PortalTable from "@/components/teacherPortalTable/PortalTable/PortalTable";
import styles from "./teacherPortal.module.css";
import router from "@/routes";
import { usePortalRead } from "@/context/PortalReadContext";

const TeacherPortalPage = () => {
    const params = useParams();
    const route = useRouter();
    const schoolId = params.schoolId as string;
    const teacherId = params.teacherId as string;
    const { teacher, setTeacherAndSchool } = usePortal();
    const { teacherTableData, isLoading } = usePortalRead();

    if (!teacherId) route.push(`${router.teacherSignIn.p}/${schoolId}`);

    useEffect(() => {
        const setTeacher = async () => {
            const response = await setTeacherAndSchool(schoolId, teacherId);
            if (!response) route.push(`${router.teacherSignIn.p}/${schoolId}`);
        };
        if (!teacher) setTeacher();
    }, [teacherId, schoolId]);

    return (
        <section className={styles.content}>
            <div className={styles.whiteBox}>
                <PortalTable tableData={teacherTableData} mode="read" />
            </div>
        </section>
    );
};

export default TeacherPortalPage;
