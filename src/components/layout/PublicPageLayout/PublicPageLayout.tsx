"use client";

import React from "react";
import styles from "./PublicPageLayout.module.css";
import CommonTopNav from "@/components/navigation/CommonTopNav/CommonTopNav";
import { PublicPortalProvider } from "@/context/PublicPortalContext";

type PublicPageLayoutProps = {
    CustomTopNav?: React.ReactNode;
    children: React.ReactNode;
};

export default function PublicPageLayout({ CustomTopNav, children }: PublicPageLayoutProps) {
    return (
        <PublicPortalProvider>
            <div className={styles.publicPageLayout} dir="rtl">
                <header className={styles.contentHeader}>
                    {CustomTopNav ?? <CommonTopNav type="list" />}
                </header>
                <main className={styles.contentMain}>
                    <div className={styles.scrollInner}>{children}</div>
                </main>
            </div>
        </PublicPortalProvider>
    );
}
