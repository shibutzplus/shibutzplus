"use client";

import React, { useState } from "react";
import { NextPage } from "next";
import Preloader from "@/components/ui/Preloader/Preloader";
import { useDailyTableContext } from "@/context/DailyTableContext";
import styles from "./DailySchedule.module.css";
import DailyTable from "@/components/tables/dailyScheduleTable/DailyTable/DailyTable";
import PreviewTable from "@/components/tables/previewTable/PreviewTable/PreviewTable";
import EmptyTable from "@/components/empty/EmptyTable/EmptyTable";
import LoadingPage from "@/components/loading/LoadingPage/LoadingPage";
import { TeacherTableProvider } from "@/context/TeacherTableContext";
import SlidingPanel from "@/components/ui/SlidingPanel/SlidingPanel";
import TeacherTable from "@/components/tables/teacherScheduleTable/TeacherTable/TeacherTable";
import { TeacherType } from "@/models/types/teachers";
import { useMainContext } from "@/context/MainContext";

const DailySchedulePage: NextPage = () => {
    const { isLoading, isEditMode, selectedDate, mainDailyTable, isLoadingEditPage } =
        useDailyTableContext();
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
                    top: "40%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                }}
            >
                <Preloader />
            </div>
        );
    if (isLoadingEditPage) return <LoadingPage />;

    return (
        <TeacherTableProvider>
            <section className={styles.container}>
                {isEditMode ? (
                    <DailyTable
                        mainDailyTable={mainDailyTable}
                        selectedDate={selectedDate}
                        onTeacherClick={handleTeacherClick}
                    />
                ) : (
                    <PreviewTable
                        mainDailyTable={mainDailyTable}
                        selectedDate={selectedDate}
                        EmptyTable={() => (
                            <EmptyTable
                                message="מערכת השעות להיום טרם הוזנה"
                                showIcons={false}
                            />
                        )}
                        onTeacherClick={handleTeacherClick}
                    />
                )}

                <SlidingPanel
                    isOpen={isPanelOpen}
                    onClose={handleClosePanel}
                    title={teacher?.name || ""}
                >
                    {teacher ? (
                        <TeacherTable
                            teacher={teacher}
                            selectedDate={selectedDate}
                            isInsidePanel
                            hoursNum={settings?.hoursNum}
                        />
                    ) : null}
                </SlidingPanel>
            </section>
        </TeacherTableProvider>
    );
};

export default DailySchedulePage;
