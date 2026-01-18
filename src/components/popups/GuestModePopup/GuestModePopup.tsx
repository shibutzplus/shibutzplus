"use client";

import React from "react";
import { usePopup } from "@/context/PopupContext";
import styles from "./GuestModePopup.module.css";
import { sendAdminContactEmail } from "@/app/actions/POST/sendEmailAction";
import ContactUsForm from "@/components/actions/ContactUsForm/ContactUsForm";

interface GuestModePopupProps {
    onClose?: () => void;
}

const GuestModePopup: React.FC<GuestModePopupProps> = ({ onClose }) => {
    const { closePopup } = usePopup();

    const handleClose = () => {
        if (onClose) onClose();
        closePopup();
    };

    const handleSend = async (message: string) => {
        await sendAdminContactEmail({
            adminName: "Guest User",
            adminEmail: "guest@shibutzplus.com",
            message: `פנייה ממצב אורח: ${message}`,
        });
    };

    return (
        <div className={styles.popupContent}>

            <h2 className={styles.title}>מוכנים להתחיל לעבוד על הדבר האמיתי?</h2>

            <div className={styles.bodyText}>
                בואו נפתח לכם סביבת עבודה לבית הספר שלכם. זה לוקח רגע.
            </div>

            <div className={styles.contactForm}>
                <ContactUsForm
                    onSend={handleSend}
                    onSuccess={handleClose}
                    submitText="שליחה"
                    placeholder={`כיתבו לנו,
כולל מספר טלפון לקשר מהיר בווטסאפ...`}
                    buttonVariant="filled"
                    className=""
                />
            </div>

            <div className={styles.buttonContainer}>
                {/* Close button provided by ContactUsForm implicitly via flow or explicit below */}
                <button
                    className={styles.closeButton}
                    onClick={handleClose}
                >
                    סגור
                </button>
            </div>
        </div>
    );
};

export default GuestModePopup;
