"use client";

import React, { useEffect } from "react";
import { NextPage } from "next";
import styles from "./PublishedPortal.module.css";
import PreviewTable from "@/components/tables/dailyViewTable/PreviewTable/PreviewTable";
import { usePortalContext } from "@/context/PortalContext";
import Preloader from "@/components/ui/Preloader/Preloader";
import NotPublished from "@/components/empty/NotPublished/NotPublished";
import ContactAdminError from "@/components/auth/ContactAdminError/ContactAdminError";

import { getDayNumberByDateString } from "@/utils/time";

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

    const [showError, setShowError] = React.useState(false);

    useEffect(() => {
        // If teacher is already loaded, we are good
        if (teacher) return;

        // Check local storage directly
        const stored = localStorage.getItem("teacher_data"); // Helper function might be better but direct access is sync
        if (!stored) {
            setShowError(true);
        }
    }, [teacher]);

    useEffect(() => {
        fetchPublishScheduleData();
    }, [selectedDate, teacher?.id, schoolId]);

    if (showError && !teacher) {
        return <ContactAdminError />;
    }

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

    const isShabbat = selectedDate ? getDayNumberByDateString(selectedDate) === 7 : false;

    return (
        <section className={styles.container}>
            <PreviewTable
                mainDailyTable={mainPublishTable}
                selectedDate={selectedDate}
                appType="public"
                EmptyTable={(props) => (
                    <NotPublished
                        {...props}
                        text={isShabbat ? "סוף שבוע נעים" : "המערכת הבית ספרית לא פורסמה"}
                    />
                )}
                hoursNum={settings?.hoursNum}
            />
        </section>
    );
};

export default PublishedPortalPage;
