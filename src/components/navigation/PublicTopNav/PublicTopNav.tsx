"use client";

import React, { useEffect, useState, useMemo } from "react";
import styles from "./PublicTopNav.module.css";
import Logo from "../../core/Logo/Logo";
import { usePublicPortal } from "@/context/PublicPortalContext";
import { usePathname, useRouter } from "next/navigation";
import { getPageTitleFromUrl } from "@/utils/format";
import PortalTopActions from "@/components/actions/PortalTopActions/PortalTopActions";
import { getTeacherCookie } from "@/utils/cookies";

import { HamburgerButton } from "@/components/navigation/HamburgerNav/HamburgerNav";
import TeacherHamburgerNav from "@/components/navigation/HamburgerNav/TeacherHamburgerNav";
import Cookies from "js-cookie";
import { COOKIES_KEYS } from "@/resources/storage";

const PublicTopNav: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();

  const [pageTitle, setPageTitle] = useState("");
  const [teacherName, setTeacherName] = useState<string | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const routeKey = getPageTitleFromUrl(pathname);
    if (routeKey) setPageTitle(routeKey);
  }, [pathname]);

  const isTeacherPortal = useMemo(
    () => pathname?.startsWith("/teacher-portal") || pathname?.startsWith("/teachers"),
    [pathname]
  );

  useEffect(() => {
    if (!isTeacherPortal) return;
    const teacher = getTeacherCookie() as { id: string; name: string } | undefined;
    setTeacherName(teacher?.name || null);
  }, [isTeacherPortal]);

  const { switchReadAndWrite } = usePublicPortal();

  const handleLogout = () => {
    Cookies.remove(COOKIES_KEYS.REMEMBERED_TEACHER);
    setIsMenuOpen(false);
    router.push("/");
  };

  return (
    <>
      <header className={styles.contentHeader}>
        <div className={styles.headerRight}>
          {isTeacherPortal && (
            <HamburgerButton onClick={() => setIsMenuOpen(v => !v)} isOpen={isMenuOpen} />
          )}

          {isTeacherPortal && teacherName ? (
            <h2 className={styles.routeTitle}>
              <div>שלום</div>
              <div className={styles.teacherName}>{teacherName}</div>
            </h2>
          ) : (
            <h2 className={styles.routeTitle}>{pageTitle}</h2>
          )}
          <PortalTopActions />
        </div>
        <div className={styles.headerLeft}>
          <Logo size="S" />
        </div>
      </header>

      {isTeacherPortal && (
        <TeacherHamburgerNav
          isOpen={isMenuOpen}
          onClose={() => setIsMenuOpen(false)}
          onLogout={handleLogout}
        />
      )}
    </>
  );
};

export default PublicTopNav;
