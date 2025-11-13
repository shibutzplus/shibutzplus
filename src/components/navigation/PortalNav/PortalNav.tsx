import React from "react";
import styles from "./PortalNav.module.css";
import Icons from "@/style/icons";
import router from "@/routes";
import { useRouter, usePathname } from "next/navigation";
import { usePortal } from "@/context/PortalContext";
//NOT IN USE
const PortalNav: React.FC = () => {
    const route = useRouter();
    const pathname = usePathname();
    const { teacher } = usePortal();

    const pushToTeacherPortalWrite = () => {
        if (teacher) route.push(`${router.teacherPortal.p}/${teacher.schoolId}/${teacher.id}`);
    };

    const pushToDailySchedulePortal = () => {
        route.push(`${router.publishedPortal.p}`);
    };

    return (
        <div className={styles.topButtonsContainer}>
            <button
                type="button"
                aria-label="המערכת שלי"
                onClick={pushToTeacherPortalWrite}
                className={`${styles.topBtn} ${pathname.includes(router.teacherPortal.p) ? styles.active : ""}`}
            >
                {pathname.includes(router.teacherPortal.p) ? (
                    <Icons.bookFill size={16} style={{ marginInlineEnd: "4px" }} />
                ) : (
                    <Icons.book size={16} style={{ marginInlineEnd: "4px" }} />
                )}
                המערכת שלי
            </button>

            <span className={styles.separator}>|</span>

            <button
                type="button"
                aria-label="מערכת בית ספרית"
                onClick={pushToDailySchedulePortal}
                className={`${styles.topBtn} ${pathname.includes(router.publishedPortal.p) ? styles.active : ""}`}
            >
                {pathname.includes(router.publishedPortal.p) ? (
                    <Icons.calendarFill size={16} style={{ marginInlineEnd: "4px" }} />
                ) : (
                    <Icons.calendar size={16} style={{ marginInlineEnd: "4px" }} />
                )}
                מערכת בית ספרית
            </button>
        </div>
    );
};

export default PortalNav;
