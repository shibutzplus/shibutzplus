import React from "react";
import styles from "./LegalPageLayout.module.css";
import Logo from "@/components/ui/Logo/Logo";

interface LegalPageLayoutProps {
    children: React.ReactNode;
}

const LegalPageLayout: React.FC<LegalPageLayoutProps> = ({ children }) => {
    return (
        <div className={styles.legalPageLayout}>
            <header className={styles.header}>
                <div className={styles.logoWrapper}>
                    <Logo />
                </div>
            </header>
            <main className={styles.main}>
                {children}
            </main>
        </div>
    );
};

export default LegalPageLayout;
