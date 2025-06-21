"use client";

import React, { useState, useMemo } from "react";
import { NextPage } from "next";
import { DailySchedule } from "@/models/types/dailySchedule";
import { useSession } from "next-auth/react";
import { createId } from "@paralleldrive/cuid2";

// Hours of the day (school hours)
const hoursOfDay = ["8:00", "9:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00"];

const DailySchedulePage: NextPage = () => {
    const { data: session } = useSession();
    const schoolId = session?.user?.id || "school1"; // Default for demo
    
    // Current date state
    const [currentDate, setCurrentDate] = useState<Date>(new Date());
    
    // Format date for display
    const formattedDate = useMemo(() => {
        return new Intl.DateTimeFormat('he-IL', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }).format(currentDate);
    }, [currentDate]);
    
    // Sample data - in a real app, this would be fetched from the database based on the selected date
    const [dailySchedule, setDailySchedule] = useState<DailySchedule[]>([
        {
            id: createId(),
            date: currentDate,
            hour: 0, // 8:00
            position: "2025-11-04-hour0",
            schoolId: schoolId,
            classId: "1", // א1
            subjectId: "1", // Math
            absentTeacherId: "",
            presentTeacherId: "1", // Regular teacher
            subTeacherId: "",
        },
        {
            id: createId(),
            date: currentDate,
            hour: 1, // 9:00
            position: "2025-11-04-hour1",
            schoolId: schoolId,
            classId: "1", // א1
            subjectId: "2", // English
            absentTeacherId: "2", // Regular teacher is absent
            presentTeacherId: "",
            subTeacherId: "3", // Substitute teacher
        },
        {
            id: createId(),
            date: currentDate,
            hour: 2, // 10:00
            position: "2025-11-04-hour2",
            schoolId: schoolId,
            classId: "1", // א1
            subjectId: "3", // Hebrew
            absentTeacherId: "",
            presentTeacherId: "3", // Regular teacher
            subTeacherId: "",
            event: "טקס יום הזיכרון", // Special event
        },
    ]);

    // Group schedule entries by hour for easier rendering
    const scheduleByHour = useMemo(() => {
        const result: Record<string, DailySchedule[]> = {};
        
        // Initialize the structure with empty arrays
        hoursOfDay.forEach((_, hourIndex) => {
            result[hourIndex] = [];
        });
        
        // Fill with actual schedule data
        dailySchedule.forEach(entry => {
            if (!result[entry.hour]) {
                result[entry.hour] = [];
            }
            result[entry.hour].push(entry);
        });
        
        return result;
    }, [dailySchedule]);

    // Navigate to previous day
    const goToPreviousDay = () => {
        const prevDay = new Date(currentDate);
        prevDay.setDate(prevDay.getDate() - 1);
        setCurrentDate(prevDay);
        // In a real app, you would fetch the schedule for the new date here
    };

    // Navigate to next day
    const goToNextDay = () => {
        const nextDay = new Date(currentDate);
        nextDay.setDate(nextDay.getDate() + 1);
        setCurrentDate(nextDay);
        // In a real app, you would fetch the schedule for the new date here
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <button 
                    onClick={goToPreviousDay}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                    יום קודם
                </button>
                <h1 className="text-2xl font-bold text-center">
                    מערכת יומית - {formattedDate}
                </h1>
                <button 
                    onClick={goToNextDay}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                    יום הבא
                </button>
            </div>
            
            <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="border p-2 text-right">שעה</th>
                            <th className="border p-2 text-right">כיתה</th>
                            <th className="border p-2 text-right">מקצוע</th>
                            <th className="border p-2 text-right">מורה קבוע</th>
                            <th className="border p-2 text-right">מורה מחליף</th>
                            <th className="border p-2 text-right">אירוע מיוחד</th>
                            <th className="border p-2 text-right">פעולות</th>
                        </tr>
                    </thead>
                    <tbody>
                        {hoursOfDay.map((hour, hourIndex) => {
                            const entries = scheduleByHour[hourIndex] || [];
                            
                            return entries.length > 0 ? (
                                entries.map(entry => (
                                    <tr key={entry.id} className={entry.absentTeacherId ? "bg-yellow-50" : entry.event ? "bg-blue-50" : ""}>
                                        <td className="border p-2 font-medium text-right">{hour}</td>
                                        <td className="border p-2 text-right">{entry.classId}</td>
                                        <td className="border p-2 text-right">{entry.subjectId}</td>
                                        <td className="border p-2 text-right">
                                            {entry.absentTeacherId ? (
                                                <span className="text-red-500">נעדר</span>
                                            ) : entry.presentTeacherId}
                                        </td>
                                        <td className="border p-2 text-right">{entry.subTeacherId || "-"}</td>
                                        <td className="border p-2 text-right">{entry.event || "-"}</td>
                                        <td className="border p-2 text-right">
                                            <button 
                                                className="text-blue-600 hover:text-blue-800 mr-2"
                                                onClick={() => console.log("Edit entry:", entry)}
                                            >
                                                ערוך
                                            </button>
                                            <button 
                                                className="text-red-600 hover:text-red-800"
                                                onClick={() => console.log("Delete entry:", entry)}
                                            >
                                                מחק
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr key={`empty-${hourIndex}`}>
                                    <td className="border p-2 font-medium text-right">{hour}</td>
                                    <td className="border p-2 text-right" colSpan={5}>אין שיעורים</td>
                                    <td className="border p-2 text-right">
                                        <button 
                                            className="text-blue-600 hover:text-blue-800"
                                            onClick={() => console.log(`Add entry for hour ${hourIndex}`)}
                                        >
                                            + הוסף שיעור
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default DailySchedulePage;
