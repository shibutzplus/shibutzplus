"use client";

import React, { useRef } from "react";
import styles from "./PopupModal.module.css";
import CloseButton from "@/components/ui/buttons/CloseButton/CloseButton";
import { PopupSize } from "@/models/types/ui";
import { useAccessibility } from "@/hooks/browser/useAccessibility";

interface PopupModalProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
    size: PopupSize;
}

const PopupModal: React.FC<PopupModalProps> = ({ isOpen, onClose, children, size }) => {
    const modalRef = useRef<HTMLDivElement>(null);
    useAccessibility({ isOpen, navRef: modalRef, onClose });

    if (!isOpen) return null;

    return (
        <div className={styles.modalOverlay}>
            <div className={`${styles.modalContainer} ${styles[`size${size}`]}`} ref={modalRef}>
                <CloseButton
                    onClose={onClose}
                    className={styles.closeButton}
                />
                <div className={styles.modalContent}>{children}</div>
            </div>
        </div>
    );
};

export default PopupModal;
