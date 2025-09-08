"use client";

import { useParams, useRouter } from "next/navigation";
import React, { useEffect } from "react";
import { usePortal } from "@/context/PortalContext";
import PortalTable from "@/components/teacherPortalTable/PortalTable/PortalTable";
import styles from "./teacherPortal.module.css";
import router from "@/routes";

const TeacherPortalPage = () => {
    const params = useParams();
    const route = useRouter();
    const schoolId = params.schoolId as string | undefined;
    const teacherId = params.teacherId as string | undefined;
    const { teacher, setTeacherAndSchool } = usePortal();

    if (!schoolId) route.push(`${router.teacherSignIn.p}`);
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
                <PortalTable />
            </div>
        </section>
    );
};

export default TeacherPortalPage;
