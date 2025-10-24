import React from "react";
import styles from "./PageLayout.module.css";

type PageLayoutProps = {
    TopNav: React.ReactNode;
    children: React.ReactNode;
};

export default function PageLayout({ TopNav, children }: PageLayoutProps) {
    return (
        <div className={styles.privatePageLayout} dir="rtl">
            <header className={styles.contentHeader}>{TopNav}</header>
            <main className={styles.contentMain}>
                <div className={styles.scrollInner}>{children}</div>
            </main>
        </div>
    );
}
