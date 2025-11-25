"use client";

import React from "react";
import styles from "./PageSkeleton.module.css";

type PageSkeletonProps = {
    children: React.ReactNode;
};

export default function PageSkeleton({ children }: PageSkeletonProps) {
    return (
        <div className={styles.pageLayout}>
            <header className={styles.topNavLayout}>
                <section className={styles.topNavSection}></section>
            </header>
            <main className={styles.mainContent}>{children}</main>
        </div>
    );
}
