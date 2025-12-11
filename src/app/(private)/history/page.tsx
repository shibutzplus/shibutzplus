"use client";

import React, { useState } from "react";
import type { NextPage } from "next";
import styles from "./history.module.css";
import PreviewTable from "@/components/tables/previewTable/PreviewTable/PreviewTable";
import { useHistoryTable } from "@/context/HistoryTableContext";
import NotPublished from "@/components/empty/NotPublished/NotPublished";
import Preloader from "@/components/ui/Preloader/Preloader";
import { TeacherTableProvider } from "@/context/TeacherTableContext";
import SlidingPanel from "@/components/ui/SlidingPanel/SlidingPanel";
import TeacherTable from "@/components/tables/teacherScheduleTable/TeacherTable/TeacherTable";
import { TeacherType } from "@/models/types/teachers";
import { useMainContext } from "@/context/MainContext";

const HistorySchedulePage: NextPage = () => {
    const { mainDailyTable, selectedYearDate, isLoading } = useHistoryTable();
    const { settings } = useMainContext();

    const [isPanelOpen, setIsPanelOpen] = useState<boolean>(false);
    const [teacher, setTeacher] = useState<TeacherType>();

    const handleTeacherClick = async (teacher: TeacherType) => {
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
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                }}
            >
                <Preloader />
            </div>
        );

    return (
        <TeacherTableProvider>
            <section className={styles.container}>
                <PreviewTable
                    mainDailyTable={mainDailyTable}
                    selectedDate={selectedYearDate}
                    EmptyTable={NotPublished}
                    onTeacherClick={handleTeacherClick}
                    hoursNum={settings?.hoursNum}
                />
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
                        hoursNum={settings?.hoursNum}
                        fitToSchedule
                    />
                ) : null}
            </SlidingPanel>
        </TeacherTableProvider>
    );
};

export default HistorySchedulePage;
