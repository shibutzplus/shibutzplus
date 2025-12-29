"use client";

import React from "react";
import { usePopup } from "@/context/PopupContext";
import styles from "./GuestModePopup.module.css";
import Icons from "@/style/icons";
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
            <div className={styles.iconContainer}>
                <div className={styles.iconBackground}>
                    <Icons.faq size={40} />
                </div>
            </div>

            <h2 className={styles.title}>המערכת פועלת כעת במצב אור להתרשמות כללית ממערכת שיבוץ+</h2>

            <div className={styles.bodyText}>
                כדי לעבוד באופן מלא – לנהל מערכת שעות יומית, לשבץ מורים ולשמור נתונים – נדרש רישום של בית הספר והפעלת חשבון מורשה.
                <div style={{ marginTop: 7 }}>נשמח ללוות בתהליך קצר ופשוט.</div>
            </div>

            <div className={styles.contactForm}>
                <ContactUsForm
                    onSend={handleSend}
                    onSuccess={handleClose}
                    submitText="יצירת קשר"
                    placeholder={`כתבו כאן את ההודעה שלכם
כולל מספר טלפון לקשר מהיר בווטסאפ או כתובת מייל...`}
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
