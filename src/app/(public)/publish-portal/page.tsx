"use client";

import React, { useEffect } from "react";
import { NextPage } from "next";
import styles from "./PublishedPortal.module.css";
import PreviewTable from "@/components/tables/previewTable/PreviewTable/PreviewTable";
import { usePortalContext } from "@/context/PortalContext";
import Preloader from "@/components/ui/Preloader/Preloader";
import NotPublished from "@/components/empty/NotPublished/NotPublished";

const PublishedPortalPage: NextPage = () => {
    const {
        selectedDate,
        teacher,
        schoolId,
        mainPublishTable,
        fetchPublishScheduleData,
        isDatesLoading,
        hasFetched,
        settings,
    } = usePortalContext();

    useEffect(() => {
        fetchPublishScheduleData();
    }, [selectedDate, teacher?.id, schoolId]);

    if (!hasFetched || isDatesLoading) {
        return (
            <div style={{ position: "relative", width: "100%", height: "100%" }}>
                <Preloader
                    style={{
                        position: "fixed",
                        top: "40%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        zIndex: 10,
                    }}
                />
            </div>
        );
    }

    return (
        <section className={styles.container}>
            <PreviewTable
                mainDailyTable={mainPublishTable}
                selectedDate={selectedDate}
                appType="public"
                EmptyTable={(props) => <NotPublished {...props} text="המערכת הבית ספרית טרם פורסמה" />}
                hoursNum={settings?.hoursNum}
            />
        </section>
    );
};

export default PublishedPortalPage;
