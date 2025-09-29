"use client";

import React, { useEffect, useRef, useState } from "react";
import type { NextPage } from "next";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import styles from "./history.module.css";
import PublishedSkeleton from "@/components/layout/skeleton/PublishedSkeleton/PublishedSkeleton";
import TeacherMaterial from "@/components/popups/TeacherMaterial/TeacherMaterial";
import ViewTable from "@/components/viewTable/ViewTable/ViewTable";
import { useHistoryTable } from "@/context/HistoryTableContext";
import { useMainContext } from "@/context/MainContext";
import { getDailyScheduleAction } from "@/app/actions/GET/getDailyScheduleAction";
import { DailyScheduleType } from "@/models/types/dailySchedule";
import { errorToast } from "@/lib/toast";
import messages from "@/resources/messages";

const HistorySchedulePage: NextPage = () => {
    const { school } = useMainContext();
    const { selectedYearDate } = useHistoryTable();
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    // Prefer date from URL; fallback to context selection
    const dateFromQuery = searchParams.get("date");

    const [prevSelectedDate, setPrevSelectedDate] = useState<string>(selectedYearDate);
    const [currentDateData, setCurrentDateData] = useState<DailyScheduleType[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isTeacherModalOpen, setIsTeacherModalOpen] = useState(false);
    const [selectedTeacher, setSelectedTeacher] = useState<{ id?: string; name: string; date: string } | null>(null);

    // Ensure ?date exists on first entry; if missing, inject today's date via replace (no history entry)
    useEffect(() => {
        if (typeof window === "undefined") return;
        if (searchParams.get("date")) return; // already has date

        // Build YYYY-MM-DD in local time
        const d = new Date();
        const mm = String(d.getMonth() + 1).padStart(2, "0");
        const dd = String(d.getDate()).padStart(2, "0");
        const today = `${d.getFullYear()}-${mm}-${dd}`;

        // Preserve any existing params and inject date
        const sp = new URLSearchParams(searchParams.toString());
        sp.set("date", today);

        router.replace(`${pathname}?${sp.toString()}`, { scroll: false });
        // When params update, the guard above prevents loops
    }, [pathname, router, searchParams]);

    const fetchDailyScheduleData = async () => {
        // Prefer URL date when available, otherwise fall back to selectedYearDate
        const targetDate = dateFromQuery || selectedYearDate;
        if (!school || !targetDate) return;

        try {
            setIsLoading(true);
            const response = await getDailyScheduleAction(school.id, targetDate, { isPrivate: false });
            if (response.success && response.data) {
                setCurrentDateData(response.data);
                setPrevSelectedDate(selectedYearDate);
                blockRef.current = false;
            } else {
                errorToast(response.message || messages.dailySchedule.error);
                setCurrentDateData([]);
            }
        } catch (error) {
            console.error("Error fetching daily schedule:", error);
            errorToast(messages.dailySchedule.error);
            setCurrentDateData([]);
        } finally {
            setIsLoading(false);
        }
    };

    // Block first render loops and re-fetch only when relevant inputs actually change
    const blockRef = useRef<boolean>(true);
    useEffect(() => {
        if (selectedYearDate !== prevSelectedDate) {
            blockRef.current = true;
        }
        if (blockRef.current) {
            fetchDailyScheduleData();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dateFromQuery, selectedYearDate, school]);

    const handleTeacherClick = (teacherName: string, teacherId?: string) => {
        const date = dateFromQuery || selectedYearDate || "";
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
