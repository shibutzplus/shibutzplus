"use client";

import React, { useRef, useEffect } from "react";
import styles from "./HamburgerNav.module.css"; // reuse same CSS
import Icons from "@/style/icons";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void; // parent handles cookie clear + redirect
};

const TeacherHamburgerNav: React.FC<Props> = ({ isOpen, onClose, onLogout }) => {
  const navRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!overlayRef.current) return;
    if (!isOpen) overlayRef.current.setAttribute("inert", "");
    else overlayRef.current.removeAttribute("inert");
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      className={`${styles.overlay} ${isOpen ? styles.open : ""}`}
      onClick={onClose}
    >
      <div
        ref={navRef}
        className={`${styles.nav} ${isOpen ? styles.open : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        onClick={(e) => e.stopPropagation()}
      >
        <button className={styles.closeButton} onClick={onClose} aria-label="Close menu">
          <Icons.close size={24} />
        </button>

        <section className={styles.logoutSection}>
          <button
            className={styles.navLink}
            onClick={() => {
              onClose();
              onLogout();
            }}
            aria-label="Logout"
          >
            <Icons.logOut size={24} />
            <span>יציאה מהמערכת</span>
          </button>
        </section>
      </div>
    </div>
  );
};

export default TeacherHamburgerNav;
