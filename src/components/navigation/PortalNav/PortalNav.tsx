import React from "react";
import styles from "./PortalNav.module.css";
import Icons from "@/style/icons";
import router from "@/routes";
import { useRouter, usePathname } from "next/navigation";
import { usePortalContext } from "@/context/PortalContext";


const PortalNav: React.FC = () => {
    const route = useRouter();
    const pathname = usePathname();
    const { mainPublishTable, selectedDate } = usePortalContext();

    const columnCount = Object.keys(mainPublishTable[selectedDate] || {}).length;

    const handleSchoolChangesClick = () => {
        if (columnCount > 13) {
            route.push(router.schoolChanges.p);
        } else {
            route.push(router.schoolChangesFull.p);
        }
    };

    const isActive = pathname.includes(router.schoolChangesFull.p) || pathname.includes(router.schoolChanges.p);

    return (
        <div className={styles.topButtonsContainer}>
            <button
                type="button"
                aria-label="מערכת בית ספרית"
                title="מערכת בית ספרית"
                onClick={handleSchoolChangesClick}
                className={`${styles.topBtn} ${isActive ? styles.active : ""}`}
            >
                <Icons.table size={18} style={{ marginInlineEnd: "4px" }} />
                <span className={styles.btnText}>מערכת בית ספרית</span>
            </button>
        </div>
    );
};

export default PortalNav;
