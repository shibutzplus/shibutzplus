import React from "react";
import styles from "./PortalNav.module.css";
import Icons from "@/style/icons";
import router from "@/routes";
import { useRouter, usePathname } from "next/navigation";
import { usePortalContext } from "@/context/PortalContext";

const PortalNav: React.FC = () => {
    const route = useRouter();
    const pathname = usePathname();
    const { teacher } = usePortalContext();

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
                title="המערכת שלי"
                onClick={pushToTeacherPortalWrite}
                className={`${styles.topBtn} ${pathname.includes(router.teacherPortal.p) ? styles.active : ""}`}
            >
                {pathname.includes(router.teacherPortal.p) ? (
                    <Icons.teacherSolid size={22} style={{ marginInlineEnd: "4px" }} />
                ) : (
                    <Icons.teacher size={18} style={{ marginInlineEnd: "4px" }} />
                )}
                <span className={styles.btnText}>המערכת שלי</span>
            </button>

            <button
                type="button"
                aria-label="מערכת בית ספרית"
                title="מערכת בית ספרית"
                onClick={pushToDailySchedulePortal}
                className={`${styles.topBtn} ${pathname.includes(router.publishedPortal.p) ? styles.active : ""}`}
            >
                {pathname.includes(router.publishedPortal.p) ? (
                    <Icons.groupSolid size={22} style={{ marginInlineEnd: "4px" }} />
                ) : (
                    <Icons.group size={22} style={{ marginInlineEnd: "4px" }} />
                )}
                <span className={styles.btnText}>מערכת בית ספרית</span>
            </button>
        </div>
    );
};

export default PortalNav;
