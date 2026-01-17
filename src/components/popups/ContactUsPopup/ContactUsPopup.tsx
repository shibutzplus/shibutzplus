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

            <h2 className={styles.title}>רוצים להתקדם לשיבוץ+</h2>

            <div className={styles.bodyText}>
                לקבלת פרטים נוספים או הצטרפות לתוכנית ההרצה, כתבו לנו כאן ונחזור אליכם מיד.
            </div>

            <div className={styles.contactForm}>
                <ContactUsForm
                    onSend={handleSend}
                    onSuccess={handleClose}
                    submitText="שליחה"
                    placeholder={`שמכם, דרך ליצירת קשר ונושא הפנייה`}
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
