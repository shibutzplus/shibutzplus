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
        if (teacher) route.push(`${router.teacherMaterialPortal.p}/${teacher.schoolId}/${teacher.id}`);
    };

    const pushToDailySchedulePortal = () => {
        route.push(`${router.scheduleViewPortal.p}`);
    };

    return (
        <div className={styles.topButtonsContainer}>
            <button
                type="button"
                aria-label="המערכת שלי"
                title="המערכת שלי"
                onClick={pushToTeacherPortalWrite}
                className={`${styles.topBtn} ${pathname.includes(router.teacherMaterialPortal.p) ? styles.active : ""}`}
            >
                {pathname.includes(router.teacherMaterialPortal.p) ? (
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
                className={`${styles.topBtn} ${pathname.includes(router.scheduleViewPortal.p) ? styles.active : ""}`}
            >
                {pathname.includes(router.scheduleViewPortal.p) ? (
                    <Icons.groupSolid size={22} style={{ marginInlineEnd: "4px" }} />
                ) : (
                    <Icons.group size={22} style={{ marginInlineEnd: "4px" }} />
                )}
                <span className={styles.btnText}>מערכת בית ספרית</span>
            </button>

            <button
                type="button"
                aria-label="מערכת במסך מלא"
                title="מערכת במסך מלא"
                onClick={() => route.push(router.fullScheduleView.p)}
                className={`${styles.topBtn} ${pathname.includes(router.fullScheduleView.p) ? styles.active : ""}`}
            >
                {pathname.includes(router.fullScheduleView.p) ? (
                    <Icons.tvSolid size={22} style={{ marginInlineEnd: "4px" }} />
                ) : (
                    <Icons.tv size={22} style={{ marginInlineEnd: "4px" }} />
                )}
                <span className={styles.btnText}>מערכת במסך מלא</span>
            </button>
        </div>
    );
};

export default PortalNav;
