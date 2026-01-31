"use client";

import React, { useState } from "react";
import { NextPage } from "next";
import { useMainContext } from "@/context/MainContext";
import { useDailyTableContext } from "@/context/DailyTableContext";
import { TeacherTableProvider, useTeacherTableContext } from "@/context/TeacherTableContext";
import Preloader from "@/components/ui/Preloader/Preloader";
import SlidingPanel from "@/components/ui/SlidingPanel/SlidingPanel";
import FullScreenContainer from "@/components/layout/pageLayouts/FullScreenLayout/FullScreenContainer";
import DailyFullScreenTable from "@/components/tables/dailyFullScreenTable/DailyFullScreenTable";
import DailyTable from "@/components/tables/dailyEditTable/DailyTable/DailyTable";
import TeacherTable from "@/components/tables/teacherMaterialTable/TeacherTable/TeacherTable";
import styles from "./DailySchedule.module.css";
import { TeacherType } from "@/models/types/teachers";
import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { usePopup } from "@/context/PopupContext";
import MsgPopup from "@/components/popups/MsgPopup/MsgPopup";

const DailyScheduleContent: React.FC = () => {
    const { isLoading, selectedDate, mainDailyTable, isPreviewMode, togglePreviewMode } =
        useDailyTableContext();
    const { settings } = useMainContext();
    const { fetchTeacherScheduleDate } = useTeacherTableContext();
    const { openPopup } = usePopup();

    const [isPanelOpen, setIsPanelOpen] = useState<boolean>(false);
    const [teacher, setTeacher] = useState<TeacherType>();

    const handleTeacherClick = async (teacher: TeacherType) => {
        setTeacher(teacher);
        setIsPanelOpen(true);
    };

    const handleFullScreenTeacherClick = async (teacher: TeacherType) => {
        await fetchTeacherScheduleDate(teacher, selectedDate);
        handleTeacherClick(teacher);
    };

    const handleClosePanel = () => {
        setIsPanelOpen(false);
    };

    const { data: session } = useSession();

    useEffect(() => {
        if (session?.user?.createdAt) {
            const createdAt = new Date(session.user.createdAt).getTime();
            const now = Date.now();
            const isNewUser = (now - createdAt) < 60000;

            if (isNewUser) {
                const hasShown = sessionStorage.getItem("welcomeToastShown");
                if (!hasShown) {
                    openPopup(
                        "msgPopup",
                        "S",
                        <MsgPopup
                            message={
                                <div style={{ textAlign: "right" }}>
                                    <p style={{ fontWeight: "bold", marginBottom: "20px", fontSize: "24px" }}>ברוכים הבאים לשיבוץ+</p>
                                    <p style={{ marginBottom: "10px" }}>
                                        אתם נמצאים במצב &quot;התנסות&quot; בבית ספר לדוגמה.
                                    </p>
                                    <p style={{ marginBottom: "10px" }}>
                                        מוזמנים להתנסות בשיבוץ המערכת היומית.
                                    </p>
                                </div>
                            }
                        />
                    );
                    sessionStorage.setItem("welcomeToastShown", "true");
                }
            }
        }
    }, [session, openPopup]);

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
        <section className={styles.container}>
            {isPreviewMode ? (
                <FullScreenContainer onExit={togglePreviewMode}>
                    <DailyFullScreenTable
                        mainDailyTable={mainDailyTable}
                        selectedDate={selectedDate}
                        hoursNum={settings?.hoursNum}
                        onTeacherClick={handleFullScreenTeacherClick}
                        screenType="dailySchedule"
                    />
                </FullScreenContainer>
            ) : (
                <DailyTable
                    mainDailyTable={mainDailyTable}
                    selectedDate={selectedDate}
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
    );
};

const DailySchedulePage: NextPage = () => {
    return (
        <TeacherTableProvider>
            <DailyScheduleContent />
        </TeacherTableProvider>
    );
};

export default DailySchedulePage;
