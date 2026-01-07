"use client";

import React, { useEffect } from "react";
import { NextPage } from "next";
import styles from "./FullScheduleView.module.css";
import DailyFullScreenTable from "@/components/tables/dailyFullScreenTable/DailyFullScreenTable";
import { usePortalContext } from "@/context/PortalContext";
import Preloader from "@/components/ui/Preloader/Preloader";
import NotPublished from "@/components/empty/NotPublished/NotPublished";
import ContactAdminError from "@/components/auth/ContactAdminError/ContactAdminError";
import { getDayNumberByDateString } from "@/utils/time";

const FullScheduleViewPage: NextPage = () => {
    const {
        selectedDate,
        teacher,
        schoolId,
        mainPublishTable,
        fetchPublishScheduleData,
        isDatesLoading,
        hasFetched,
        settings,
        datesOptions,
        isPublishLoading,
    } = usePortalContext();

    const [showError, setShowError] = React.useState(false);

    useEffect(() => {
        // If teacher is already loaded, we are good
        if (teacher) return;

        // Check local storage directly
        const stored = localStorage.getItem("teacher_data");
        if (!stored) {
            setShowError(true);
        }
    }, [teacher]);

    useEffect(() => {
        fetchPublishScheduleData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedDate, teacher?.id, schoolId]);

    const schedule = mainPublishTable[selectedDate];
    const colCount = schedule ? Object.keys(schedule).length : 0;

    if (showError && !teacher) {
        return <ContactAdminError />;
    }

    const isShabbat = selectedDate ? getDayNumberByDateString(selectedDate) === 7 : false;
    const isPublished = datesOptions.some((d) => d.value === selectedDate);
    const getEmptyText = () => {
        if (isShabbat) return "סוף שבוע נעים";
        if (isPublished) return "אין עדכונים במערכת שפורסמה";
        return "המערכת הבית ספרית לא פורסמה";
    };

    if (!hasFetched || isDatesLoading || isPublishLoading) {
        return (
            <div style={{ position: "relative", width: "100%", height: "100vh" }}>
                <Preloader
                    style={{
                        position: "fixed",
                        top: "50%",
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
            <DailyFullScreenTable
                mainDailyTable={mainPublishTable}
                selectedDate={selectedDate}
                EmptyTable={(props) => (
                    <NotPublished
                        {...props}
                        text={getEmptyText()}
                    />
                )}
                hoursNum={settings?.hoursNum}
                appType="public"
            />
        </section>
    );
};

export default FullScheduleViewPage;
