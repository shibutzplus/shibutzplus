"use client";

import { useParams, useRouter } from "next/navigation";
import React, { useEffect } from "react";
import { usePublicPortal } from "@/context/PublicPortalContext";
import { errorToast } from "@/lib/toast";
import messages from "@/resources/messages";
import PortalTable from "@/components/teacherPortalTable/PortalTable/PortalTable";
import styles from "./teacherPortal.module.css";
import PublicMobileNav from "@/components/navigation/PublicMobileNav/PublicMobileNav";
import { useMobileSize } from "@/hooks/useMobileSize";
import { useDisablePageScroll } from "@/hooks/useDisablePageScroll";
import router from "@/routes";

const TeacherPortalPage = () => {
  const params = useParams();
  const route = useRouter();
  const schoolId = params.schoolId as string;
  const teacherId = params.teacherId as string;
  const { teacherTableData, setTeacherById } = usePublicPortal();
  const isMobile = useMobileSize();

  useDisablePageScroll();

  useEffect(() => {
    if(!teacherId) route.push(`${router.teacherSignIn.p}/${schoolId}`);

    const setTeacher = async () => {
      const response = await setTeacherById(teacherId);
      if (!response) errorToast(messages.dailySchedule.error);
    };
    setTeacher();
  }, [teacherId, schoolId]);

  return (
    <div className={styles.container}>
      <section className={`${styles.content} ${isMobile ? styles.withBottomPadding : ""}`}>
        <div className={styles.whiteBox}>
          <PortalTable tableData={teacherTableData} />
        </div>
      </section>
      {isMobile ? <PublicMobileNav /> : null}
    </div>
  );
};

export default TeacherPortalPage;
