"use client";

import React, { useEffect, useRef } from "react";
import styles from "./PopupModal.module.css";
import { PopupSize } from "@/models/types/ui";

interface PopupModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  size: PopupSize;
}

const PopupModal: React.FC<PopupModalProps> = ({ isOpen, onClose, children, size }) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.addEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "hidden"; // Prevent scrolling when modal is open
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.removeEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = ""; // Re-enable scrolling when modal is closed
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div 
        className={`${styles.modalContainer} ${styles[`size${size}`]}`} 
        ref={modalRef}
      >
        <button 
          className={styles.closeButton} 
          onClick={onClose}
          aria-label="סגור"
        >
          ×
        </button>
        <div className={styles.modalContent}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default PopupModal;
