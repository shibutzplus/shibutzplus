"use client";

import React, { useState, useMemo, useEffect } from "react";
import { NextPage } from "next";
import { DailyScheduleType } from "@/models/types/dailySchedule";
import { useSession } from "next-auth/react";
import { useMainContext } from "@/context/MainContext";
import DailyScheduleTopButtons from "@/components/DailySchedule/DailyScheduleTopButtons";
import DailyScheduleTable from "@/components/DailySchedule/DailyScheduleTable";
import { getDailyScheduleAction } from "@/app/actions/getDailyScheduleAction";

const DailySchedulePage: NextPage = () => {
    const { data: session } = useSession();
    const { dailyScheduleData, teachers, classes, subjects, school, updateDailySchedule } =
        useMainContext();
    const schoolId = school?.id || session?.user?.id || "school1"; // Default for demo

    const [isLoading, setIsLoading] = useState<boolean>(false);

    // Use data from context if available
    const [dailySchedule, setDailySchedule] = useState<DailyScheduleType[]>(
        dailyScheduleData || [],
    );

    const handleScheduleChange = (updatedSchedule: DailyScheduleType[]) => {
        // Log the updated schedule
        console.log("Updated schedule:", updatedSchedule);

        // Update the schedule in the state and context
        setDailySchedule(updatedSchedule);
        updateDailySchedule(updatedSchedule);
    };

    // Reference to the DailyScheduleTable component
    const tableRef = React.useRef<{
        addTeacherColumn: () => void;
        addInfoColumn: () => void;
        addMissingTeacherColumn: () => void;
    } | null>(null);

    // Handlers for adding columns
    const handleAddTeacherColumn = () => {
        if (tableRef.current) {
            tableRef.current.addTeacherColumn();
        }
    };

    const handleAddInfoColumn = () => {
        if (tableRef.current) {
            tableRef.current.addInfoColumn();
        }
    };

    const handleAddMissingTeacherColumn = () => {
        if (tableRef.current) {
            tableRef.current.addMissingTeacherColumn();
        }
    };

    return (
        <>
        <div style={{marginBottom: "5rem"}}>
            <DailyScheduleTopButtons
                onAddTeacherColumn={handleAddTeacherColumn}
                onAddInfoColumn={handleAddInfoColumn}
                onAddMissingTeacherColumn={handleAddMissingTeacherColumn}
            />

        </div>
            <div style={{marginTop: "5rem"}}>
                {isLoading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="text-xl">טוען נתונים...</div>
                    </div>
                ) : teachers && classes && subjects ? (
                    <DailyScheduleTable
                        ref={tableRef}
                        scheduleData={dailySchedule}
                        teachers={teachers}
                        classes={classes}
                        subjects={subjects}
                        onScheduleChange={handleScheduleChange}
                    />
                ) : (
                    <div className="text-center py-8">אין נתונים זמינים</div>
                )}
            </div>
        </>
    );
};

export default DailySchedulePage;
