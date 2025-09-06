"use client";

import React from "react";
import styles from "./PortalTopActions.module.css";
import DynamicInputSelect from "@/components/ui/select/InputSelect/DynamicInputSelect";
import Icons from "@/style/icons";
import { usePortal } from "@/context/PortalContext";
import { TeacherRoleValues } from "@/models/types/teachers";
import { usePathname, useRouter } from "next/navigation";
import router from "@/routes";

const PortalTopActions: React.FC = () => {
    const route = useRouter();
    const pathname = usePathname();
    const { teacher, selectedDate, isLoading, publishDatesOptions, handleDayChange } = usePortal();

    const pushToTeacherPortalWrite = () => {
        if (teacher) route.push(`${router.teacherPortalWrite.p}/${teacher.schoolId}/${teacher.id}`);
        return;
    };

    const pushToTeacherPortalRead = () => {
        if (teacher) route.push(`${router.teacherPortalRead.p}/${teacher.schoolId}/${teacher.id}`);
        return;
    };

    const pushToDailySchedulePortal = () => {
        route.push(`${router.dailySchedulePortal.p}`);
        return;
    };

    return (
        <section className={styles.actionsContainer}>
            <div className={styles.selectContainer}>
                <DynamicInputSelect
                    options={publishDatesOptions}
                    value={selectedDate}
                    isDisabled={isLoading}
                    onChange={handleDayChange}
                    isSearchable={false}
                    placeholder="בחר יום..."
                    hasBorder
                />
            </div>

            {teacher?.role === TeacherRoleValues.REGULAR && (
                <div className={styles.topButtonsContainer}>
                    <button
                        type="button"
                        aria-label="הזנת חומרי לימוד"
                        onClick={pushToTeacherPortalWrite}
                        className={`${styles.topBtn} ${pathname.includes(router.teacherPortalWrite.p) ? styles.active : ""}`}
                    >
                        {pathname.includes(router.teacherPortalWrite.p) ? (
                            <Icons.bookFill size={16} style={{ marginInlineEnd: "4px" }} />
                        ) : (
                            <Icons.book size={16} style={{ marginInlineEnd: "4px" }} />
                        )}
                        הזנת חומרי לימוד
                    </button>

                    <span className={styles.separator}>|</span>

                    <button
                        type="button"
                        aria-label="המערכת שלי"
                        onClick={pushToTeacherPortalRead}
                        className={`${styles.topBtn} ${pathname.includes(router.teacherPortalRead.p) ? styles.active : ""}`}
                    >
                        {pathname.includes(router.teacherPortalRead.p) ? (
                            <Icons.dailyCalendarFill size={16} style={{ marginInlineEnd: "4px" }} />
                        ) : (
                            <Icons.dailyCalendar size={16} style={{ marginInlineEnd: "4px" }} />
                        )}
                        המערכת שלי
                    </button>

                    <span className={styles.separator}>|</span>

                    <button
                        type="button"
                        aria-label="מערכת בית ספרית"
                        onClick={pushToDailySchedulePortal}
                        className={`${styles.topBtn} ${pathname.includes(router.dailySchedulePortal.p) ? styles.active : ""}`}
                    >
                        {pathname.includes(router.dailySchedulePortal.p) ? (
                            <Icons.calendarFill size={16} style={{ marginInlineEnd: "4px" }} />
                        ) : (
                            <Icons.calendar size={16} style={{ marginInlineEnd: "4px" }} />
                        )}
                        מערכת בית ספרית
                    </button>
                </div>
            )}
        </section>
    );
};

export default PortalTopActions;
