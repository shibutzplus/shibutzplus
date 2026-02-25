"use client";

import React, { useState } from "react";
import type { NextPage } from "next";
import styles from "./history.module.css";
import PreviewTable from "@/components/tables/dailyViewTable/PreviewTable/PreviewTable";
import DailyFullScreenTable from "@/components/tables/dailyFullScreenTable/DailyFullScreenTable";
import { useHistoryTable } from "@/context/HistoryTableContext";
import NotPublished from "@/components/empty/NotPublished/NotPublished";
import Preloader from "@/components/ui/Preloader/Preloader";
import { TeacherTableProvider, useTeacherTableContext } from "@/context/TeacherTableContext";
import SlidingPanel from "@/components/ui/SlidingPanel/SlidingPanel";
import TeacherTable from "@/components/tables/teacherMaterialTable/TeacherTable/TeacherTable";
import { TeacherType } from "@/models/types/teachers";
import { useMainContext } from "@/context/MainContext";
import { PortalType } from "@/models/types";


const HistoryScheduleContent: React.FC = () => {
    const { mainDailyTable, selectedYearDate, isLoading } = useHistoryTable();
    const { settings } = useMainContext();
    const [isPanelOpen, setIsPanelOpen] = useState<boolean>(false);
    const [teacher, setTeacher] = useState<TeacherType>();
    const { resetSchedule } = useTeacherTableContext();

    const handleTeacherClick = async (teacher: TeacherType) => {
        resetSchedule();
        setTeacher(teacher);
        setIsPanelOpen(true);
    };

    const handleClosePanel = () => {
        setIsPanelOpen(false);
    };

    if (isLoading)
        return (
            <div
                style={{
                    position: "absolute",
                    top: "40%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                }}
            >
                <Preloader />
            </div>
        );

    return (
        <>
            <section className={styles.container}>
                {/* History table — hidden on print as we display the full screen table on print*/}
                <div className={styles.noPrint}>
                    <PreviewTable
                        mainDailyTable={mainDailyTable}
                        selectedDate={selectedYearDate}
                        EmptyTable={NotPublished}
                        emptyText="אין נתוני היסטוריה ליום שנבחר"
                        onTeacherClick={handleTeacherClick}
                        fromHour={settings?.fromHour}
                        toHour={settings?.toHour}
                    />
                </div>

                {/* Full-screen table — shown only on print */}
                <div className={styles.printOnly}>
                    <DailyFullScreenTable
                        mainDailyTable={mainDailyTable}
                        selectedDate={selectedYearDate}
                        fromHour={settings?.fromHour}
                        toHour={settings?.toHour}
                    />
                </div>
            </section>
            <SlidingPanel
                isOpen={isPanelOpen}
                onClose={handleClosePanel}
                title={teacher?.name || ""}
            >
                {teacher ? (
                    <TeacherTable
                        teacher={teacher}
                        selectedDate={selectedYearDate}
                        isInsidePanel
                        fromHour={settings?.fromHour}
                        toHour={settings?.toHour}
                        portalType={PortalType.Manager}
                    />
                ) : null}
            </SlidingPanel>
        </>
    );
};

const HistorySchedulePage: NextPage = () => {
    return (
        <TeacherTableProvider isHistoryPage={true}>
            <HistoryScheduleContent />
        </TeacherTableProvider>
    );
};

export default HistorySchedulePage;
