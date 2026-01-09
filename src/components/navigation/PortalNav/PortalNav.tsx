import React from "react";
import styles from "./PortalNav.module.css";
import Icons from "@/style/icons";
import router from "@/routes";
import { useRouter, usePathname } from "next/navigation";


const PortalNav: React.FC = () => {
    const route = useRouter();
    const pathname = usePathname();

    return (
        <div className={styles.topButtonsContainer}>
            <button
                type="button"
                aria-label="מערכת בית ספרית"
                title="מערכת בית ספרית"
                onClick={() => route.push(router.fullScheduleView.p)}
                className={`${styles.topBtn} ${pathname.includes(router.fullScheduleView.p) ? styles.active : ""}`}
            >
                <Icons.table size={18} style={{ marginInlineEnd: "4px" }} />
                <span className={styles.btnText}>מערכת בית ספרית</span>
            </button>
        </div>
    );
};

export default PortalNav;
