"use client";

import React, { useEffect } from "react";
import { NextPage } from "next";
import styles from "./FullScheduleView.module.css";
import TvScheduleTable from "@/components/tables/dailyViewTable/TvScheduleTable/TvScheduleTable";
import { usePortalContext } from "@/context/PortalContext";
import Preloader from "@/components/ui/Preloader/Preloader";
import NotPublished from "@/components/empty/NotPublished/NotPublished";
import ContactAdminError from "@/components/auth/ContactAdminError/ContactAdminError";
import { getDayNumberByDateString } from "@/utils/time";
import { successToast } from "@/lib/toast";

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
    const hasShownToast = React.useRef(false);

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
    }, [selectedDate, teacher?.id, schoolId]);

    if (showError && !teacher) {
        return <ContactAdminError />;
    }

    const schedule = mainPublishTable[selectedDate];
    const colCount = schedule ? Object.keys(schedule).length : 0;

    useEffect(() => {
        if (!isDatesLoading && !isPublishLoading && window.innerWidth < 500 && colCount > 4 && !hasShownToast.current) {
            successToast("לצפייה מיטבית, מומלץ לסובב את המכשיר לרוחב. ", 3000);
            hasShownToast.current = true;
        }
    }, [isDatesLoading, isPublishLoading, colCount]);

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
            <TvScheduleTable
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
