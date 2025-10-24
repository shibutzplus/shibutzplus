import React from "react";
import styles from "./PageLayout.module.css";
import MobileNav from "@/components/navigation/MobileNav/MobileNav";

type PageLayoutProps = {
    TopNav: React.ReactNode;
    hasMobileNav?: boolean;
    children: React.ReactNode;
};

export default function PageLayout({ TopNav, hasMobileNav = false, children }: PageLayoutProps) {
    return (
        <div className={styles.privatePageLayout} dir="rtl">
            <header className={styles.contentHeader}>{TopNav}</header>
            <main className={styles.contentMain}>
                <div className={styles.scrollInner}>{children}</div>
            </main>
            {hasMobileNav ? <MobileNav /> : null}
        </div>
    );
}
