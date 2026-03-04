"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getStorageTeacher } from "@/lib/localStorage";
import ContactAdminError from "@/components/auth/ContactAdminError/ContactAdminError";
import { getSchoolAction } from "@/app/actions/GET/getSchoolAction";
import { getPortalEntryPath } from "@/utils/portalRouting";

import styles from "./teacherSignIn.module.css";

export default function TeacherSignIn() {
  const router = useRouter();

  useEffect(() => {
    const autoLogin = async () => {
      const teacherData = getStorageTeacher();

      if (teacherData && teacherData.schoolId && teacherData.id) {
        const schoolResp = await getSchoolAction(teacherData.schoolId);
        const publishDates = schoolResp.success && schoolResp.data ? schoolResp.data.publishDates : [];
        const displayAltSchedule = schoolResp.success && schoolResp.data ? schoolResp.data.displayAltSchedule : false;

        router.push(getPortalEntryPath(teacherData.role, teacherData.schoolId, teacherData.id, publishDates, displayAltSchedule));
      }
    };

    autoLogin();
  }, [router]);

  return (
    <div className={styles.container}>
      <div className={styles.heroBackground}>
        <div className={`${styles.blob} ${styles.blob1}`} />
        <div className={`${styles.blob} ${styles.blob2}`} />
      </div>
      <ContactAdminError />
    </div>
  );
}
