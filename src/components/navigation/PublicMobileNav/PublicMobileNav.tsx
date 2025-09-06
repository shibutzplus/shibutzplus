"use client";

import React from "react";
import styles from "./PublicMobileNav.module.css";
import Icons from "@/style/icons";
import { usePortal } from "@/context/PortalContext";
import { usePathname, useRouter } from "next/navigation";
import router from "@/routes";

const PublicMobileNav: React.FC = () => {
    const route = useRouter();
    const pathname = usePathname();
    const { teacher } = usePortal();

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
        <nav className={styles.mobileNav} role="navigation" aria-label="Bottom navigation">
            <button
                type="button"
                aria-label="הזנת חומרי לימוד"
                onClick={pushToTeacherPortalWrite}
                className={`${styles.item} ${pathname.includes(router.teacherPortalWrite.p) ? styles.active : ""}`}
            >
                {pathname.includes(router.teacherPortalWrite.p) ? (
                    <Icons.bookFill size={16} style={{ marginInlineEnd: "4px" }} />
                ) : (
                    <Icons.book size={16} style={{ marginInlineEnd: "4px" }} />
                )}
                <span className={styles.label}>הזנת חומרי לימוד</span>
            </button>

            <button
                type="button"
                aria-label="המערכת שלי"
                onClick={pushToTeacherPortalRead}
                className={`${styles.item} ${pathname.includes(router.teacherPortalRead.p) ? styles.active : ""}`}
            >
                {pathname.includes(router.teacherPortalRead.p)? (
                    <Icons.dailyCalendarFill size={16} style={{ marginInlineEnd: "4px" }} />
                ) : (
                    <Icons.dailyCalendar size={16} style={{ marginInlineEnd: "4px" }} />
                )}
                <span className={styles.label}>המערכת שלי</span>
            </button>

            <button
                type="button"
                aria-label="מערכת בית ספרית"
                onClick={pushToDailySchedulePortal}
                className={`${styles.item} ${pathname.includes(router.dailySchedulePortal.p) ? styles.active : ""}`}
            >
                {pathname.includes(router.dailySchedulePortal.p) ? (
                    <Icons.calendarFill size={16} style={{ marginInlineEnd: "4px" }} />
                ) : (
                    <Icons.calendar size={16} style={{ marginInlineEnd: "4px" }} />
                )}
                <span className={styles.label}>מערכת בית ספרית</span>
            </button>
        </nav>
    );
};

export default PublicMobileNav;
