"use client";

import React, { useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { getPageTitleFromUrl } from "@/utils/format";
import Logo from "@/components/core/Logo/Logo";
import HamburgerNav, { HamburgerButton } from "@/components/navigation/HamburgerNav/HamburgerNav";
import styles from "./TopNav.module.css";

export type NavType = "list" | "admin" | "portal";

type Props = {
  type: NavType;
  greetingName?: string | null;
  actions?: React.ReactNode;
  dropdowns?: React.ReactNode;
  usePageTitle?: boolean;
  sticky?: boolean;
};

const TopNav: React.FC<Props> = ({
  type,
  greetingName = null,
  actions,
  dropdowns,
  usePageTitle,
  sticky = true,
}) => {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Decide when to use the page title
  const resolvedUsePageTitle = usePageTitle ?? (type === "admin" || type === "list");

  // Compute title
  const title = useMemo(() => {
    if (type === "portal" && greetingName) return `שלום ${greetingName}`;
    if (resolvedUsePageTitle) return getPageTitleFromUrl(pathname) || "";
    return "";
  }, [type, greetingName, resolvedUsePageTitle, pathname]);

  const showHamburger = true;

  // When there are no extra elements (no actions, no dropdowns), allow title to expand
  const noExtras = !actions && !dropdowns;

  // Detect annual schedule route for special title styling
  const isAnnual = pathname.includes("/annual-schedule");

  return (
    <>
      <header
        className={`${styles.contentHeader} ${sticky ? styles.sticky : ""} ${noExtras ? styles.noExtras : ""
          }`}
      >
        <div className={styles.headerRight}>
          {showHamburger && (
            <HamburgerButton onClick={() => setIsMenuOpen(v => !v)} isOpen={isMenuOpen} />
          )}
          {!!title && (
            <h2 className={`${styles.routeTitle} ${isAnnual ? styles.annualTitle : ""}`}>
              {title}
            </h2>
          )}
          {actions ? <div className={styles.topActions}>{actions}</div> : null}
        </div>
        <div className={styles.headerLeft}>
          <Logo size="S" />
        </div>
      </header>

      {showHamburger && (
        <HamburgerNav
          isOpen={isMenuOpen}
          onClose={() => setIsMenuOpen(false)}
          variant={type === "portal" ? "portal" : "admin"}
        />
      )}
      {dropdowns ? <section className={styles.filters}>{dropdowns}</section> : null}
    </>
  );
};

export default TopNav;
