import React from "react";
import styles from "./PortalNav.module.css";
import Icons from "@/style/icons";
import router from "@/routes";
import { usePathname } from "next/navigation";
import { useSchoolChangesNav } from "@/hooks/portal/useSchoolChangesNav";

const PortalNav: React.FC = () => {
    const pathname = usePathname();
    const { navigateToSchoolChanges, isLoading } = useSchoolChangesNav();

    const isActive = pathname.includes(router.schoolChangesFull.p) || pathname.includes(router.schoolChanges.p);

    return (
        <div className={styles.topButtonsContainer}>
            <button
                type="button"
                aria-label="מערכת בית ספרית"
                title="מערכת בית ספרית"
                onClick={navigateToSchoolChanges}
                className={`${styles.topBtn} ${isActive ? styles.active : ""}`}
                disabled={isLoading}
                style={{ opacity: isLoading ? 0.6 : 1, cursor: isLoading ? "wait" : "pointer" }}
            >
                <Icons.table size={18} style={{ marginInlineEnd: "4px" }} />
                <span className={styles.btnText}>מערכת בית ספרית</span>
            </button>
        </div>
    );
};

export default PortalNav;
