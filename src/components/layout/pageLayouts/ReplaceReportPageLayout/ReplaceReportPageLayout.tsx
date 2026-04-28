"use client";

import React from "react";
import styles from "./ReplaceReportPageLayout.module.css";
import PageLayout from "../../PageLayout/PageLayout";
import router from "@/routes";
import { SCHOOL_MONTHS } from "@/utils/time";
import DynamicInputSelect from "@/components/ui/select/InputSelect/DynamicInputSelect";
import Icons from "@/style/icons";
import { ReplaceReportDictionary } from "@/app/(private)/replace-report/page";
import { useMainContext } from "@/context/MainContext";

type ReplaceReportPageLayoutProps = {
    children: React.ReactNode;
    month: string;
    setMonth: (month: string) => void;
    teacherId: string | null;
    setTeacherId: (id: string | null) => void;
    reportData: ReplaceReportDictionary;
};

const MONTH_OPTIONS = [
    ...SCHOOL_MONTHS.map((month) => ({ value: month, label: month })),
];

const getMobileMonthOptions = () => {
    return [
        ...SCHOOL_MONTHS.map((m) => {
            const index = SCHOOL_MONTHS.indexOf(m);
            const monthNum = ((index + 8) % 12) + 1;
            return {
                value: m,
                label: monthNum.toString().padStart(2, "0"),
            };
        }),
    ];
};

export default function ReplaceReportPageLayout({
    children,
    month,
    setMonth,
    teacherId,
    setTeacherId,
    reportData,
}: ReplaceReportPageLayoutProps) {
    const { teachers } = useMainContext();

    // Only show teachers that appear as substitutes in the report data
    const teachersSelectOptions = () => {
        const activeTeachers = teachers
            ? teachers.filter((t) => {
                  const days = reportData[t.id];
                  if (!days) return false;
                  return Object.values(days).some((count) => count > 0);
              })
            : [];

        const options = activeTeachers.map((teacher) => ({
            value: teacher.id,
            label: teacher.name,
        }));
        return [{ value: "all", label: "כל המחליפים" }, ...options];
    };

    const handleMonthChange = (value: string) => {
        setMonth(value);
    };

    const handleTeacherChange = (val: string | number | null) => {
        setTeacherId(val ? String(val) : null);
    };

    const handleNextTeacher = () => {
        const options = teachersSelectOptions();
        if (options.length === 0) return;
        const currentIndex = options.findIndex(
            (opt) => opt.value === (teacherId || "all")
        );
        const nextIndex = (currentIndex + 1) % options.length;
        handleTeacherChange(options[nextIndex].value);
    };

    const handlePrevTeacher = () => {
        const options = teachersSelectOptions();
        if (options.length === 0) return;
        const currentIndex = options.findIndex(
            (opt) => opt.value === (teacherId || "all")
        );
        const prevIndex = (currentIndex - 1 + options.length) % options.length;
        handleTeacherChange(options[prevIndex].value);
    };

    const mobileMonthOptions = getMobileMonthOptions();

    const HeaderRightActions = (
        <>
            <h3 className={styles.pageTitle}>
                <span className={styles.desktopOnlyTitle}>{router.replaceReport.title}</span>
                <span className={styles.mobileOnlyTitle}>מחליפים</span>
            </h3>
            <div className={styles.selectContainer}>
                <div className={styles.monthSelectWrapper}>
                    {/* Desktop Month Select */}
                    <select
                        className={`${styles.nativeSelect} ${styles.desktopOnly}`}
                        value={month}
                        onChange={(e) => handleMonthChange(e.target.value)}
                    >
                        {MONTH_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </select>

                    {/* Mobile Month Select */}
                    <select
                        className={`${styles.nativeSelect} ${styles.mobileOnly}`}
                        value={month}
                        onChange={(e) => handleMonthChange(e.target.value)}
                    >
                        {mobileMonthOptions.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </select>
                </div>
                <div className={styles.teacherSelectSection}>
                    <div className={styles.teacherSelectWrapper}>
                        <DynamicInputSelect
                            options={teachersSelectOptions()}
                            value={teacherId || undefined}
                            onChange={handleTeacherChange}
                            isSearchable={true}
                            placeholder="בחר מורה..."
                            hasBorder
                            isClearable
                        />
                    </div>
                    <button
                        className={styles.nextButton}
                        onClick={handlePrevTeacher}
                        title="הקודם"
                        type="button"
                    >
                        <Icons.caretRight size={24} />
                    </button>
                    <button
                        className={styles.nextButton}
                        onClick={handleNextTeacher}
                        title="הבא"
                        type="button"
                    >
                        <Icons.caretLeft size={24} />
                    </button>
                </div>
            </div>
        </>
    );

    return (
        <PageLayout appType="private" leftSideWidth={0} HeaderRightActions={HeaderRightActions}>
            {children}
        </PageLayout>
    );
}
