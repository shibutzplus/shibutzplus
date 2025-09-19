"use client";

import React, { useEffect, useRef } from "react";
import styles from "./PublishedPortal.module.css";
import { usePortal } from "@/context/PortalContext";
import { errorToast } from "@/lib/toast";
import ViewTable from "@/components/viewTable/ViewTable/ViewTable";
import PublishedSkeleton from "@/components/layout/skeleton/PublishedSkeleton/PublishedSkeleton";
import { NextPage } from "next";

const PublishedPortalPage: NextPage = () => {
    const { isPublishLoading, selectedDate, mainPublishTable, fetchPublishScheduleData } =
        usePortal();

    const blockRef = useRef<boolean>(true);
    useEffect(() => {
        const fetchData = async () => {
            if (blockRef.current && mainPublishTable.length === 0) {
                const response = await fetchPublishScheduleData();
                if (response.success) blockRef.current = false;
                else if (response.error !== "") {
                    errorToast(response.error);
                }
            }
        };
        fetchData();
    }, [selectedDate]);

    if (isPublishLoading) return <PublishedSkeleton />;

    return (
        <div className={styles.content}>
            <div className={styles.tableWrapper}>
                <ViewTable
                    scheduleData={mainPublishTable}
                    noScheduleTitle="אין נתונים להצגה"
                    noScheduleSubTitle={["לא פורסמה מערכת"]}
                    hasMobileNav
                />
            </div>
        </div>
    );
};

export default PublishedPortalPage;
