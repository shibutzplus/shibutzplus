"use client";

import React from "react";
import styles from "./PublicMobileNav.module.css";
import Icons from "@/style/icons";
import { usePublicPortal } from "@/context/PublicPortalContext";

const PublicMobileNav: React.FC = () => {
  const { switchReadAndWrite, pageMode } = usePublicPortal();

  // force-write mode
  const goWriteMode = () => {
    if (pageMode === "read") switchReadAndWrite("write");
  };

  // force-read mode
  const goMySchedule = () => {
    if (pageMode === "write") switchReadAndWrite("read");
  };

  const goSchoolView = () => {
    alert("תצוגת מערכת בית ספרית תתווסף בהמשך");
  };

  return (
    <nav className={styles.mobileNav} role="navigation" aria-label="Bottom navigation">
      <button
        type="button"
        className={`${styles.item} ${pageMode === "write" ? styles.active : ""}`}
        onClick={goWriteMode}
        aria-label="הזנת חומרי לימוד"
      >
        <Icons.plus size={20} />
        <span className={styles.label}>הזנת חומרי לימוד</span>
      </button>

      <button
        type="button"
        className={`${styles.item} ${pageMode === "read" ? styles.active : ""}`}
        onClick={goMySchedule}
        aria-label="המערכת שלי"
      >
        <Icons.teacher1 size={20} />
        <span className={styles.label}>המערכת שלי</span>
      </button>

      <button
        type="button"
        className={styles.item}
        onClick={goSchoolView}
        aria-label="מערכת בית ספרית"
      >
        <Icons.calendar size={20} />
        <span className={styles.label}>מערכת בית ספרית</span>
      </button>
    </nav>
  );
};

export default PublicMobileNav;
