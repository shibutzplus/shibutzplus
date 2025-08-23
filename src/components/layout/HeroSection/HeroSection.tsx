import React from "react";
import styles from "./HeroSection.module.css";
import Logo from "@/components/core/Logo/Logo";

type HeroSectionProps = {
    title: string;
    description: string;
};

const HeroSection: React.FC<HeroSectionProps> = ({ title, description }) => {
    return (
        <div className={styles.heroSection}>
            <div className={styles.schoolIcon}>
                <Logo />
            </div>
            <h2 className={styles.schoolTitle}>שיבוץ +</h2>

            <div className={styles.schoolDescription}>
                <h3>{title}</h3>
                <p>{description}</p>
            </div>
        </div>
    );
};

export default HeroSection;
