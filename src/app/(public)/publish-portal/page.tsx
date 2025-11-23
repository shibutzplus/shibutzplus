"use client";

import React, { useEffect, useRef } from "react";
import { NextPage } from "next";
import styles from "./PublishedPortal.module.css";
import ViewTable from "@/components/tables/viewTable/ViewTable/ViewTable";
import PublishedSkeleton from "@/components/loading/skeleton/PublishedSkeleton/PublishedSkeleton";
import { usePortal } from "@/context/PortalContext";
import { errorToast } from "@/lib/toast";
import PreviewTable from "@/components/tables/previewTable/PreviewTable/PreviewTable";

const PublishedPortalPage: NextPage = () => {
    const { isPublishLoading, selectedDate, mainPublishTable, fetchPublishScheduleData } =
        usePortal();

    const blockRef = useRef<boolean>(true);
    useEffect(() => {
        blockRef.current = true;
        const fetchData = async () => {
            if (blockRef.current) {
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
        <section className={styles.container}>
            {/* <PreviewTable
                mainDailyTable={mainDailyTable}
                selectedDate={selectedYearDate}
            /> */}
        </section>
    );
};

export default PublishedPortalPage;
