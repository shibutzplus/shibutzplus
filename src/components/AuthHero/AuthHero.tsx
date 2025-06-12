import React from "react";
import Image from 'next/image';
import styles from "./AuthHero.module.css";
import Logo from "../core/Logo/Logo";

const AuthHero: React.FC = () => {
    return (
        <div className={styles.heroSection}>
            <div className={styles.schoolIcon}>
                <Logo/>
            </div>
            <h2 className={styles.schoolTitle}>שיבוץ +</h2>

            <div className={styles.schoolDescription}>
                <h3>מערכת לניהול בית הספר</h3>
                <p>כלים ניהוליים מתקדמים למנהלי בתי ספר וצוותים לניהול יעיל של פעילות הבית ספרית</p>
            </div>
            
            <div className={styles.illustrationContainer}>
                <Image 
                    src="/undraw_workspace_s6wf.svg" 
                    alt="Workspace Illustration" 
                    width={150} 
                    height={50} 
                    className={styles.illustration}
                />
            </div>
        </div>
    );
};

export default AuthHero;
