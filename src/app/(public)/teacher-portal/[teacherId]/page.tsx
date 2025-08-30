"use client";

import { useParams } from "next/navigation";
import React, { useEffect } from "react";
import { usePublicPortal } from "@/context/PublicPortalContext";
import { errorToast } from "@/lib/toast";
import messages from "@/resources/messages";
import PortalTable from "@/components/teacherPortalTable/PortalTable/PortalTable";
import styles from "./teacherPortal.module.css";
import PublicMobileNav from "@/components/navigation/PublicMobileNav/PublicMobileNav";
import { useMobileSize } from "@/hooks/useMobileSize";

const TeacherPortalPage = () => {
    const params = useParams();
    const teacherId = params.teacherId as string;
    const { teacherTableData, setTeacherById } = usePublicPortal();
    const isMobile = useMobileSize();

    useEffect(() => {
        const setTeacher = async () => {
            const response = await setTeacherById(teacherId);
            if (!response) errorToast(messages.dailySchedule.error);
        };
        setTeacher();
    }, [teacherId]);

    return (
        <div className={styles.container}>
            <div className={styles.whiteBox}>
                <PortalTable tableData={teacherTableData} />
            </div>
            {isMobile ? <PublicMobileNav /> : null}
        </div>
    );
};

export default TeacherPortalPage;
