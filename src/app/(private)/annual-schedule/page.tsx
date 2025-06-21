"use client";

import React, { useState, useEffect } from "react";
import styles from "./annualSchedule.module.css";
import { NextPage } from "next";
import InputSelect from "@/components/ui/InputSelect/InputSelect";
import { SelectOption } from "@/models/types";
import SubmitBtn from "@/components/ui/SubmitBtn/SubmitBtn";

// Mock data for classes
const classOptions: SelectOption[] = [
    { value: "א1", label: "א1" },
    { value: "א2", label: "א2" },
    { value: "ב1", label: "ב1" },
    { value: "ב2", label: "ב2" },
    { value: "ג1", label: "ג1" },
    { value: "ג2", label: "ג2" },
];

// Mock data for teachers
const teacherOptions: SelectOption[] = [
    { value: "רחל", label: "רחל" },
    { value: "דוד", label: "דוד" },
    { value: "יוסי", label: "יוסי" },
    { value: "מיכל", label: "מיכל" },
    { value: "אבי", label: "אבי" },
    { value: "שרה", label: "שרה" },
];

// Mock data for professions
const professionOptions: SelectOption[] = [
    { value: "מתמטיקה", label: "מתמטיקה" },
    { value: "אנגלית", label: "אנגלית" },
    { value: "עברית", label: "עברית" },
    { value: "מדעים", label: "מדעים" },
    { value: "תנ״ך", label: "תנ״ך" },
    { value: "היסטוריה", label: "היסטוריה" },
    { value: "חינוך גופני", label: "חינוך גופני" },
    { value: "אומנות", label: "אומנות" },
];

// Days of the week in Hebrew
const daysOfWeek = ["יום א׳", "יום ב׳", "יום ג׳", "יום ד׳", "יום ה׳", "יום ו׳"];

// Number of hours in a day
const hoursInDay = 7;

interface ScheduleCell {
    teacher: string;
    profession: string;
}

interface WeeklySchedule {
    [className: string]: {
        [day: string]: {
            [hour: string]: ScheduleCell;
        };
    };
}

const AnnualSchedulePage: NextPage = () => {
    const [selectedClass, setSelectedClass] = useState<string>("א1");
    const [showTable, setShowTable] = useState<boolean>(true);
    const [schedule, setSchedule] = useState<WeeklySchedule>({});

    // Initialize empty schedule for the selected class
    useEffect(() => {
        if (!schedule[selectedClass]) {
            const newSchedule = { ...schedule };
            newSchedule[selectedClass] = {};

            daysOfWeek.forEach((day) => {
                newSchedule[selectedClass][day] = {};

                for (let hour = 1; hour <= hoursInDay; hour++) {
                    newSchedule[selectedClass][day][hour] = {
                        teacher: "",
                        profession: "",
                    };
                }
            });

            setSchedule(newSchedule);
        }
    }, [selectedClass, schedule]);

    const handleClassChange = (value: string) => {
        setSelectedClass(value);
        setShowTable(true);
    };

    const handleTeacherChange = (day: string, hour: number, value: string) => {
        const newSchedule = { ...schedule };
        if (!newSchedule[selectedClass][day][hour]) {
            newSchedule[selectedClass][day][hour] = { teacher: "", profession: "" };
        }
        newSchedule[selectedClass][day][hour].teacher = value;
        setSchedule(newSchedule);
    };

    const handleProfessionChange = (day: string, hour: number, value: string) => {
        const newSchedule = { ...schedule };
        if (!newSchedule[selectedClass][day][hour]) {
            newSchedule[selectedClass][day][hour] = { teacher: "", profession: "" };
        }
        newSchedule[selectedClass][day][hour].profession = value;
        setSchedule(newSchedule);
    };

    return (
        <div className={styles.container}>
            <div className={styles.whiteBox}>
                <section className={styles.classSelectorSection}>
                    <div className={styles.classSelectorRight}>
                        <h3>בחרו כיתה: </h3>

                        <div className={styles.classSelector}>
                            <InputSelect
                                options={classOptions}
                                value={selectedClass}
                                onChange={handleClassChange}
                                placeholder="בחר כיתה..."
                            />
                        </div>
                    </div>
                    <div className={styles.publishButtonContainer}>
                        <SubmitBtn
                            type={"button"}
                            isLoading={false}
                            loadingText={""}
                            buttonText={"פרסם גרסה סופית"}
                        />
                    </div>
                </section>

                {showTable && (
                    <div className={styles.tableContainer}>
                        <table className={styles.scheduleTable}>
                            <thead>
                                <tr>
                                    <th className={styles.hourHeader}></th>
                                    {daysOfWeek.map((day) => (
                                        <th key={day} className={styles.dayHeader}>
                                            {day}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {Array.from({ length: hoursInDay }, (_, i) => i + 1).map((hour) => (
                                    <tr key={hour}>
                                        <td className={styles.hourCell}>{hour}</td>
                                        {daysOfWeek.map((day) => (
                                            <td
                                                key={`${day}-${hour}`}
                                                className={styles.scheduleCell}
                                            >
                                                <div className={styles.cellContent}>
                                                    <InputSelect
                                                        options={teacherOptions}
                                                        placeholder="מורה"
                                                        value={
                                                            schedule[selectedClass]?.[day]?.[hour]
                                                                ?.teacher || ""
                                                        }
                                                        onChange={(value: string) =>
                                                            handleTeacherChange(day, hour, value)
                                                        }
                                                        isSearchable={true}
                                                        allowAddNew={true}
                                                    />
                                                    <InputSelect
                                                        options={professionOptions}
                                                        placeholder="מקצוע"
                                                        value={
                                                            schedule[selectedClass]?.[day]?.[hour]
                                                                ?.profession || ""
                                                        }
                                                        onChange={(value: string) =>
                                                            handleProfessionChange(day, hour, value)
                                                        }
                                                        isSearchable={true}
                                                        allowAddNew={true}
                                                    />
                                                </div>
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AnnualSchedulePage;
