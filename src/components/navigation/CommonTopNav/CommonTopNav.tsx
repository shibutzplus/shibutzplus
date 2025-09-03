"use client";

import React, { useMemo, useState } from "react";
import styles from "./CommonTopNav.module.css";
import { usePathname } from "next/navigation";
import { getPageTitleFromUrl } from "@/utils/format";
import Logo from "@/components/core/Logo/Logo";
import HamburgerNav, { HamburgerButton } from "@/components/navigation/HamburgerNav/HamburgerNav";

export type TopKind = "list" | "admin" | "teacher";

type Props = {
  kind: TopKind;
  greetingName?: string | null;           // teacher only
  actions?: React.ReactNode;              // optional actions area (desktop)
  dropdowns?: React.ReactNode;            // optional filters strip under header
  usePageTitle?: boolean;                 // default: true for admin/list
  sticky?: boolean;                       // default: true
};

const CommonTopNav: React.FC<Props> = ({
  kind,
  greetingName = null,
  actions,
  dropdowns,
  usePageTitle,
  sticky = true,
}) => {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // default behavior per kind
  const resolvedUsePageTitle = usePageTitle ?? (kind === "admin" || kind === "list");

  const title = useMemo(() => {
    if (kind === "teacher" && greetingName) return `שלום ${greetingName}`;
    if (resolvedUsePageTitle) return getPageTitleFromUrl(pathname) || "";
    return "";
  }, [kind, greetingName, resolvedUsePageTitle, pathname]);

  const showHamburger = true;

  return (
    <>
      <header className={`${styles.contentHeader} ${sticky ? styles.sticky : ""}`}>
        <div className={styles.headerRight}>
          {showHamburger && (
            <HamburgerButton onClick={() => setIsMenuOpen(v => !v)} isOpen={isMenuOpen} />
          )}
          {!!title && <h2 className={styles.routeTitle}>{title}</h2>}
          {actions ? <div className={styles.topActions}>{actions}</div> : null}
        </div>
        <div className={styles.headerLeft}>
          <Logo size="S" />
        </div>
      </header>

      {/* Hamburger menu (same component you already use) */}
      {showHamburger && (
        <HamburgerNav
          isOpen={isMenuOpen}
          onClose={() => setIsMenuOpen(false)}
          variant={kind === "teacher" ? "teacher" : "admin"}
        />
      )}

      {/* dropdown/filters strip */}
      {dropdowns ? <section className={styles.filters}>{dropdowns}</section> : null}
    </>
  );
};

export default CommonTopNav;
