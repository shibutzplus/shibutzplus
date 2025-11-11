import React from "react";
import styles from "./PageLayout.module.css";

type PageLayoutProps = {
    TopNav: React.ReactNode;
    children: React.ReactNode;
};

export default function PageLayout({ TopNav, children }: PageLayoutProps) {
    return (
        <div className={styles.pageLayout}>
            <header className={styles.headerContent}>{TopNav}</header>
            <main className={styles.mainContent}>{children}</main>
        </div>
    );
}
