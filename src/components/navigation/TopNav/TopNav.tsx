import React from "react";
import styles from "./TopNav.module.css";
import Link from "next/link";
import routePath from "../../../routes";

const TopNav: React.FC = () => {
    return (
        <header className={styles.contentHeader}>
            <nav className={styles.contentNav}>
                <div className={styles.navLogo}>
                    <Link href={routePath.dashboard.p}>שיבוץ +</Link>
                </div>
                <div className={styles.navLinks}>
                </div>
            </nav>
        </header>
    );
};

export default TopNav;
