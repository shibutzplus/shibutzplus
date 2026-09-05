"use client";

import React, { useEffect } from "react";
import { NextPage } from "next";
import styles from "./FullScheduleView.module.css";
import CommonDailySchoolFullTable from "@/components/tables/commonDailySchoolFull/CommonDailySchoolFullTable";
import CommonDailyClassesFullTable from "@/components/tables/commonDailyClassesFull/CommonDailyClassesFullTable";
import { usePortalContext } from "@/context/PortalContext";
import Preloader from "@/components/ui/Preloader/Preloader";
import NotPublished from "@/components/empty/NotPublished/NotPublished";
import ContactAdminError from "@/components/auth/ContactAdminError/ContactAdminError";
import { getDayNumberByDateString } from "@/utils/time";
import { getStorageTeacher } from "@/lib/localStorage";

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

const FullScheduleViewPage: NextPage = () => {
    const {
        selectedDate,
        teacher,
        schoolId,
        mainPublishTable,
        fetchPublishScheduleData,
        settings,
        datesOptions,
        isLoading,
        viewType,
        hasClassChanges,
    } = usePortalContext();

    const [showError, setShowError] = React.useState(false);

    useEffect(() => {
        // If teacher is already loaded, we are good
        if (teacher) return;

        // Check local storage directly
        const stored = getStorageTeacher();
        if (!stored) {
            setShowError(true);
        }
    }, [teacher]);

    useEffect(() => {
        fetchPublishScheduleData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedDate, teacher?.id, schoolId]);

    if (showError && !teacher) {
        return <ContactAdminError />;
    }

    const showClasses = viewType === "classes" && hasClassChanges;

    const isShabbat = selectedDate ? getDayNumberByDateString(selectedDate) === 7 : false;
    const isPublished = datesOptions.some((d) => d.value === selectedDate);
    const getEmptyText = () => {
        if (isShabbat) return "סוף שבוע נעים";
        if (isPublished) return "אין שינויים במערכת";
        return "המערכת הבית ספרית לא פורסמה";
    };

    if (isLoading) {
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
            {showClasses ? (
                <CommonDailyClassesFullTable
                    mainDailyTable={mainPublishTable}
                    selectedDate={selectedDate}
                    EmptyTable={NotPublished}
                    emptyText={getEmptyText()}
                    fromHour={settings?.fromHour}
                    toHour={settings?.toHour}
                    appType="public"
                />
            ) : (
                <CommonDailySchoolFullTable
                    mainDailyTable={mainPublishTable}
                    selectedDate={selectedDate}
                    EmptyTable={NotPublished}
                    emptyText={getEmptyText()}
                    fromHour={settings?.fromHour}
                    toHour={settings?.toHour}
                    appType="public"
                />
            )}
        </section>
    );
};

export default FullScheduleViewPage;
