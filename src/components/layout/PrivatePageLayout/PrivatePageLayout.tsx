"use client";

import React from "react";
import styles from "./PrivatePageLayout.module.css";
import TopNav from "@/components/navigation/TopNav/TopNav";

type PrivatePageLayoutProps = {
  CustomTopNav?: React.ReactNode;
  children: React.ReactNode;
};

export default function PrivatePageLayout({ CustomTopNav, children }: PrivatePageLayoutProps) {
  return (
    <div className={styles.privatePageLayout} dir="rtl">
      <header className={styles.contentHeader}>
        {CustomTopNav ?? <TopNav />}
      </header>
      <main className={styles.contentMain}>
        <div className={styles.scrollInner}>
          {children}
        </div>
      </main>
    </div>
  );
}
