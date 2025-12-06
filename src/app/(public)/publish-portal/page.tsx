"use client";

import React, { useEffect } from "react";
import { NextPage } from "next";
import styles from "./PublishedPortal.module.css";
import PreviewTable from "@/components/tables/previewTable/PreviewTable/PreviewTable";
import { usePortalContext } from "@/context/PortalContext";
import DailySkeleton from "@/components/loading/skeleton/DailySkeleton/DailySkeleton";
import NotPublished from "@/components/empty/NotPublished/NotPublished";

const PublishedPortalPage: NextPage = () => {
    const {
        selectedDate,
        teacher,
        schoolId,
        mainPublishTable,
        isPublishLoading,
        fetchPublishScheduleData,
        isDatesLoading,
    } = usePortalContext();

    useEffect(() => {
        fetchPublishScheduleData();
    }, [selectedDate, teacher?.id, schoolId]);

    if (isDatesLoading || isPublishLoading) return <DailySkeleton />;

    if (!schoolId) return <NotPublished />;

    return (
        <section className={styles.container}>
            <PreviewTable
                mainDailyTable={mainPublishTable}
                selectedDate={selectedDate}
                appType="public"
                EmptyTable={NotPublished}
            />
        </section>
    );
};

export default PublishedPortalPage;
