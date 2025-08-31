"use client";

import { useParams } from "next/navigation";
import React, { useEffect } from "react";
import { usePublicPortal } from "@/context/PublicPortalContext";
import { errorToast } from "@/lib/toast";
import messages from "@/resources/messages";
import PortalTable from "@/components/teacherPortalTable/PortalTable/PortalTable";
import styles from "./teacherPortal.module.css";
import PublicMobileNav from "@/components/navigation/PublicMobileNav/PublicMobileNav";
import { useMobileSize } from "@/hooks/useMobileSize";

const TeacherPortalPage = () => {
  const params = useParams();
  const teacherId = params.teacherId as string;
  const { teacherTableData, setTeacherById } = usePublicPortal();
  const isMobile = useMobileSize();

  useEffect(() => {
    const setTeacher = async () => {
      const response = await setTeacherById(teacherId);
      if (!response) errorToast(messages.dailySchedule.error);
    };
    setTeacher();
  }, [teacherId]);

  // Disable page (html/body) scrolling only on this route
  useEffect(() => {
    const prevHtml = document.documentElement.style.overflow;
    const prevBody = document.body.style.overflow;
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = prevHtml;
      document.body.style.overflow = prevBody;
    };
  }, []);

  return (
    <div className={styles.container}>
      <header className={styles.header} />
      <main className={`${styles.content} ${isMobile ? styles.withBottomPadding : ""}`}>
        <div className={styles.whiteBox}>
          <PortalTable tableData={teacherTableData} />
        </div>
      </main>
      {isMobile ? <PublicMobileNav /> : <footer className={styles.footer} />}
    </div>
  );
};

export default TeacherPortalPage;
