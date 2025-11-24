"use client";

import React, { useEffect } from "react";
import { NextPage } from "next";
import styles from "./PublishedPortal.module.css";
import PublishedSkeleton from "@/components/loading/skeleton/PublishedSkeleton/PublishedSkeleton";
import PreviewTable from "@/components/tables/previewTable/PreviewTable/PreviewTable";
import { usePortalContext } from "@/context/PortalContext";

const PublishedPortalPage: NextPage = () => {
    const {
        selectedDate,
        teacher,
        schoolId,
        mainPublishTable,
        isPublishLoading,
        fetchPublishScheduleData,
    } = usePortalContext();

    useEffect(() => {
        fetchPublishScheduleData();
    }, [selectedDate, teacher?.id, schoolId]);

    if (isPublishLoading) return <PublishedSkeleton />;

    return (
        <section className={styles.container}>
            <PreviewTable
                mainDailyTable={mainPublishTable}
                selectedDate={selectedDate}
                appType="public"
            />
        </section>
    );
};

export default PublishedPortalPage;
