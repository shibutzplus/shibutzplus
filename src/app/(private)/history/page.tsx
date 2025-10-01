"use client";

import React, { useEffect, useState } from "react";
import type { NextPage } from "next";
import { useSearchParams } from "next/navigation";
import styles from "./history.module.css";
import PublishedSkeleton from "@/components/layout/skeleton/PublishedSkeleton/PublishedSkeleton";
import TeacherMaterial from "@/components/popups/TeacherMaterial/TeacherMaterial";
import ViewTable from "@/components/tables/viewTable/ViewTable/ViewTable";
import { useMainContext } from "@/context/MainContext";
import { getDailyScheduleAction } from "@/app/actions/GET/getDailyScheduleAction";
import { DailyScheduleType } from "@/models/types/dailySchedule";
import { errorToast } from "@/lib/toast";
import messages from "@/resources/messages";

const HistorySchedulePage: NextPage = () => {
    const { school } = useMainContext();
    const searchParams = useSearchParams();

    // Read date only from URL
    const dateFromQuery = searchParams.get("date") || "";

    const [currentDateData, setCurrentDateData] = useState<DailyScheduleType[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isTeacherModalOpen, setIsTeacherModalOpen] = useState(false);
    const [selectedTeacher, setSelectedTeacher] = useState<{ id?: string; name: string; date: string } | null>(null);

    const fetchDailyScheduleData = async () => {
        // No date dont fetch
        if (!school?.id || !dateFromQuery) {
            setCurrentDateData([]);
            setIsLoading(false);
            return;
        }

        try {
            setIsLoading(true);
            const response = await getDailyScheduleAction(school.id, dateFromQuery, { isPrivate: false });
            if (response.success && response.data) {
                setCurrentDateData(response.data);
            } else {
                setCurrentDateData([]);
                errorToast(response.message || messages.dailySchedule.error);
            }
        } catch (error) {
            console.error("Error fetching daily schedule:", error);
            setCurrentDateData([]);
            errorToast(messages.dailySchedule.error);
        } finally {
            setIsLoading(false);
        }
    };

    // Fetch when URL date changes
    useEffect(() => {
        fetchDailyScheduleData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dateFromQuery, school?.id]);

    const handleTeacherClick = (teacherName: string, teacherId?: string) => {
        const date = dateFromQuery || "";
        setSelectedTeacher({ id: teacherId, name: teacherName, date });
        setIsTeacherModalOpen(true);
    };

    if (isLoading) return <PublishedSkeleton />;

    return (
        <div className={styles.content}>
            <div className={styles.tableWrapper}>
                <ViewTable
                    scheduleData={currentDateData}
                    noScheduleTitle="אין נתונים להצגה"
                    noScheduleSubTitle={["לא פורסמה מערכת עבור יום זה"]}
                    onTeacherClick={handleTeacherClick}
                    isManager={true}
                />
            </div>
            <TeacherMaterial
                isOpen={isTeacherModalOpen}
                onClose={() => setIsTeacherModalOpen(false)}
                teacherName={selectedTeacher?.name || ""}
                date={selectedTeacher?.date || ""}
                teacherId={selectedTeacher?.id}
                schoolId={school?.id}
            />
        </div>
    );
};

export default HistorySchedulePage;
