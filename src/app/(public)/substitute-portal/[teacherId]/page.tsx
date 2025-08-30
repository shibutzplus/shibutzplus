"use client";

import { useParams } from "next/navigation";
import React, { useEffect } from "react";
import { usePublicPortal } from "@/context/PublicPortalContext";
import { errorToast } from "@/lib/toast";
import messages from "@/resources/messages";
import PortalTable from "@/components/teacherPortalTable/PortalTable/PortalTable";
import styles from "./substitutePortal.module.css";

const SubstitutePortalPage = () => {
    const params = useParams();
    const teacherId = params.teacherId as string;
    const { teacherTableData, setTeacherById } = usePublicPortal();

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
        </div>
    );
};

export default SubstitutePortalPage;
