"use client";

import React from "react";
import styles from "./PageSkeleton.module.css";

type PageSkeletonProps = {
    children: React.ReactNode;
    hideHeader?: boolean;
};

export default function PageSkeleton({ children, hideHeader = false }: PageSkeletonProps) {
    return (
        <div className={styles.pageLayout}>
            {!hideHeader && (
                <header className={styles.topNavLayout}>
                    <section className={styles.topNavSection}></section>
                </header>
            )}
            <main className={styles.mainContent}>{children}</main>
        </div>
    );
}
