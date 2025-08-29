"use client";

import React from "react";
import styles from "./MobileNav.module.css";
import { usePublicPortal } from "@/context/PublicPortalContext";

const MobileNav: React.FC = () => {
    const { switchReadAndWrite } = usePublicPortal();
    const handleSwitchReadAndWrite = () => {
        switchReadAndWrite();
    };
    return (
        <nav className={styles.mobileNav}>
            <div className={styles.mobileNavButton} onClick={handleSwitchReadAndWrite}>
                מחליף אותי
            </div>
            <div className={styles.mobileNavButton} onClick={handleSwitchReadAndWrite}>
                מחליף אותו
            </div>
            <div className={styles.mobileNavButton}>מערכת יומית</div>
        </nav>
    );
};

export default MobileNav;
