"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getStorageTeacher } from "@/lib/localStorage";
import routePath from "@/routes";
import ContactAdminError from "@/components/auth/ContactAdminError/ContactAdminError";

import styles from "./teacherSignIn.module.css";

export default function TeacherSignIn() {
  const router = useRouter();

  useEffect(() => {
    // Check local storage for teacher data
    const teacherData = getStorageTeacher();

    if (teacherData && teacherData.schoolId && teacherData.id) {
      // If data exists, redirect to the teacher portal
      router.push(`${routePath.teacherMaterialPortal.p}/${teacherData.schoolId}/${teacherData.id}`);
    }
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
