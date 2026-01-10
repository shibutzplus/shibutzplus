"use client";

import React from "react";
import { usePopup } from "@/context/PopupContext";
import styles from "./ContactUsPopup.module.css";
import Logo from "@/components/ui/Logo/Logo";
import { sendAdminContactEmail } from "@/app/actions/POST/sendEmailAction";
import ContactUsForm from "@/components/actions/ContactUsForm/ContactUsForm";

interface ContactUsPopupProps {
    onClose?: () => void;
}

const ContactUsPopup: React.FC<ContactUsPopupProps> = ({ onClose }) => {
    const { closePopup } = usePopup();

    const handleClose = () => {
        if (onClose) onClose();
        closePopup();
    };

    const handleSend = async (message: string) => {
        await sendAdminContactEmail({
            adminName: "Landing Page User",
            adminEmail: "landing@shibutzplus.com",
            message: `פנייה מהדף הראשי: ${message}`,
        });
    };

    return (
        <div className={styles.popupContent}>
            <div className={styles.iconContainer}>
                <Logo size="L" />
            </div>

            <h2 className={styles.title}>נשמח לשמוע מכם!</h2>

            <div className={styles.bodyText}>
                מעוניינים לשמוע עוד על שיבוץ+ או להצטרף להרצה? השאירו פרטים ונחזור אליכם בהקדם.
            </div>

            <div className={styles.contactForm}>
                <ContactUsForm
                    onSend={handleSend}
                    onSuccess={handleClose}
                    submitText="שליחת הודעה"
                    placeholder={`השאירו שם, טלפון או מייל, ומה שמעניין אתכם לדעת...`}
                    buttonVariant="filled"
                    className=""
                />
            </div>

            <button className={styles.closeButton} onClick={handleClose}>
                סגור
            </button>
        </div>
    );
};

export default ContactUsPopup;
