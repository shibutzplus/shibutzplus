"use client";

import React from "react";
import { usePathname, useRouter } from "next/navigation";
import Icons from "@/style/icons";
import { usePortal } from "@/context/PortalContext";
import router from "@/routes";
import styles from "./PublicMobileNav.module.css";
import { TeacherRoleValues } from "@/models/types/teachers";

const PublicMobileNav: React.FC = () => {
    const route = useRouter();
    const pathname = usePathname();
    const { teacher } = usePortal();

  if (!teacher || teacher.role !== TeacherRoleValues.REGULAR) return null;

  const pushToTeacherPortalWrite = () => {
        if (teacher) route.push(`${router.teacherPortal.p}/${teacher.schoolId}/${teacher.id}`);
        return;
    };

    const pushToTeacherPortalRead = () => {
        if (teacher) route.push(`${router.teacherPortal.p}/${teacher.schoolId}/${teacher.id}`);
        return;
    };

    const pushToDailySchedulePortal = () => {
        route.push(`${router.publishedPortal.p}`);
        return;
    };

    return (
        <nav className={styles.mobileNav} role="navigation" aria-label="Bottom navigation">
            <button
                type="button"
                aria-label="המערכת שלי"
                onClick={pushToTeacherPortalWrite}
                className={`${styles.item} ${pathname.includes(router.teacherPortal.p) ? styles.active : ""}`}
            >
                {pathname.includes(router.teacherPortal.p) ? (
                    <Icons.teacherSolid size={18} style={{ marginInlineEnd: "4px" }} />
                ) : (
                    <Icons.teacher size={16} style={{ marginInlineEnd: "4px" }} />
                )}
                <span className={styles.label}>המערכת שלי</span>
            </button>

            <button
                type="button"
                aria-label="מערכת בית ספרית"
                onClick={pushToDailySchedulePortal}
                className={`${styles.item} ${pathname.includes(router.publishedPortal.p) ? styles.active : ""}`}
            >
                {pathname.includes(router.publishedPortal.p) ? (
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
