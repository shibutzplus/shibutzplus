import React from "react";
import Image from "next/image";
import styles from "./AuthHero.module.css";
import Logo from "../core/Logo/Logo";

const AuthHero: React.FC = () => {
    return (
        <div className={styles.heroSection}>
            <div className={styles.schoolIcon}>
                <Logo />
            </div>
            <h2 className={styles.schoolTitle}>שיבוץ +</h2>

            <div className={styles.schoolDescription}>
                <h3>מערכת ניהול לבית הספר</h3>
                <p>בניית מערכת שעות מעודכנת ליום המחר ולימים הקרובים, בצורה קלה ומהירה</p>
            </div>

            <div className={styles.illustrationContainer}>
                <Image
                    src="/undraw_workspace_s6wf.svg"
                    alt="Workspace Illustration"
                    width={140}
                    height={40}
                    className={styles.illustration}
                    priority
                />
            </div>
        </div>
    );
};

export default AuthHero;
