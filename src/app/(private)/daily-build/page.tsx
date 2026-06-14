"use client";

import React, { useState } from "react";
import { NextPage } from "next";
import { useMainContext } from "@/context/MainContext";
import { useDailyTableContext } from "@/context/DailyTableContext";
import { TeacherTableProvider, useTeacherTableContext } from "@/context/TeacherTableContext";
import Preloader from "@/components/ui/Preloader/Preloader";
import SlidingPanel from "@/components/ui/SlidingPanel/SlidingPanel";
import FullScreenContainer from "@/components/layout/pageLayouts/FullScreenLayout/FullScreenContainer";
import CommonDailySchoolFullTable from "@/components/tables/commonDailySchoolFull/CommonDailySchoolFullTable";
import MngrDailyBldTable from "@/components/tables/mngrDailyBld/MngrDailyBldTable/MngrDailyBldTable";
import TeacherDailyChangesTable from "@/components/tables/teacherDailyChanges/TeacherDailyChangesTable/TeacherDailyChangesTable";
import TeacherCommentsPanelContent, { CommentPanelData } from "@/components/tables/teacherDailyChanges/TeacherCommentsPanelContent/TeacherCommentsPanelContent";
import styles from "./DailySchedule.module.css";
import { TeacherType } from "@/models/types/teachers";
import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { usePopup } from "@/context/PopupContext";
import MsgPopup from "@/components/popups/MsgPopup/MsgPopup";
import { PortalType } from "@/models/types";

const DailyScheduleContent: React.FC = () => {
    const { isLoading, selectedDate, mainDailyTable, isPreviewMode, togglePreviewMode } =
        useDailyTableContext();
    const { settings } = useMainContext();
    const { openPopup } = usePopup();
    const { fetchTeacherScheduleDate, resetSchedule } = useTeacherTableContext();
    const [isPanelOpen, setIsPanelOpen] = useState<boolean>(false);
    const [panelMode, setPanelMode] = useState<"schedule" | "comments">("schedule");
    const [teacher, setTeacher] = useState<TeacherType>();
    const [commentPanelData, setCommentPanelData] = useState<CommentPanelData | null>(null);
    const { setMainDailyTable } = useDailyTableContext();

    const handleTeacherClick = async (teacher: TeacherType) => {
        setTeacher(teacher);
        setPanelMode("schedule");
        setIsPanelOpen(true);
    };

    const handleCommentsClick = (data: CommentPanelData) => {
        setCommentPanelData(data);
        setPanelMode("comments");
        setIsPanelOpen(true);
    };

    const handlePreviewTeacherClick = async (teacher: TeacherType) => {
        resetSchedule();
        setTeacher(teacher);
        setIsPanelOpen(true);
        await fetchTeacherScheduleDate(teacher, selectedDate);
    };


    const { data: session } = useSession();

    useEffect(() => {
        const isDemo = session?.user?.isDemo;
        if (isDemo) {
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
                    <CommonDailySchoolFullTable
                        mainDailyTable={mainDailyTable}
                        selectedDate={selectedDate}
                        fromHour={settings?.fromHour}
                        toHour={settings?.toHour}
                        onTeacherClick={handlePreviewTeacherClick}
                    />
                </FullScreenContainer>
            ) : (
                <>
                    {/* Edit table — hidden on print cause we want to display automatically the full screen table on print */}
                    <div className={styles.noPrint}>
                        <MngrDailyBldTable
                            mainDailyTable={mainDailyTable}
                            selectedDate={selectedDate}
                            onTeacherClick={handleTeacherClick}
                            onCommentsClick={handleCommentsClick}
                        />
                    </div>

                    {/* Full-screen table — shown only on print, only when there is data */}
                    {mainDailyTable?.[selectedDate] && Object.keys(mainDailyTable[selectedDate]).length > 0 && (
                        <div className={styles.printOnly}>
                            <CommonDailySchoolFullTable
                                mainDailyTable={mainDailyTable}
                                selectedDate={selectedDate}
                                fromHour={settings?.fromHour}
                                toHour={settings?.toHour}
                            />
                        </div>
                    )}
                </>
            )}

            <SlidingPanel
                isOpen={isPanelOpen}
                onClose={() => setIsPanelOpen(false)}
                title={
                    panelMode === "comments" && commentPanelData
                        ? `הודעות עבור ${commentPanelData.teacherName} והמורים המחליפים`
                        : `הנחיות של ${teacher?.name || ""} לממלא המקום`
                }
                subtitle={null}
            >
                {panelMode === "comments" && commentPanelData ? (
                    <TeacherCommentsPanelContent
                        data={commentPanelData}
                        selectedDate={selectedDate}
                        onUpdate={(hour, comment) => {
                            setMainDailyTable((prev: any) => {
                                const updated = { ...prev };
                                const { columnId } = commentPanelData;
                                if (updated[selectedDate]?.[columnId]) {
                                    updated[selectedDate] = { ...updated[selectedDate] };
                                    updated[selectedDate][columnId] = { ...updated[selectedDate][columnId] };
                                    const cell = updated[selectedDate][columnId][hour];
                                    if (cell) {
                                        updated[selectedDate][columnId][hour] = { ...cell, comment };
                                    }
                                }
                                return updated;
                            });
                            // Keep commentPanelData in sync so re-opens show updated comments
                            setCommentPanelData((prev) =>
                                prev ? {
                                    ...prev,
                                    columnCells: {
                                        ...prev.columnCells,
                                        [hour]: { ...prev.columnCells[hour], comment },
                                    },
                                } : prev
                            );
                        }}
                    />
                ) : teacher ? (
                    <TeacherDailyChangesTable
                        teacher={teacher}
                        selectedDate={selectedDate}
                        isInsidePanel
                        fromHour={settings?.fromHour}
                        toHour={settings?.toHour}
                        portalType={PortalType.Manager}
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
