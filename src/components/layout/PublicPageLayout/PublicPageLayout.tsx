"use client";

import React from "react";
import styles from "./PublicPageLayout.module.css";
import TopNav from "@/components/navigation/TopNav/TopNav";
import { PortalProvider } from "@/context/PortalContext";

type PublicPageLayoutProps = {
    CustomTopNav?: React.ReactNode;
    children: React.ReactNode;
};

export default function PublicPageLayout({ CustomTopNav, children }: PublicPageLayoutProps) {
    return (
        <PortalProvider>
            <div className={styles.publicPageLayout} dir="rtl">
                <header className={styles.contentHeader}>
                    {CustomTopNav ?? <TopNav type="list" />}
                </header>
                <main className={styles.contentMain}>
                    <div className={styles.scrollInner}>{children}</div>
                </main>
            </div>
        </PortalProvider>
    );
}
