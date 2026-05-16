"use client";

import { useState } from "react";
import styles from "./ContactUs.module.css";

interface ContactUsProps {
    onSend: (message: string) => Promise<void>;
    title?: string;
    placeholder?: string;
}

export default function ContactUs({ onSend, title, placeholder }: ContactUsProps) {
    const [contactMessage, setContactMessage] = useState<string>("");
    const [isSending, setIsSending] = useState<boolean>(false);

    const handleSend = async () => {
        if (!contactMessage.trim() || isSending) {
            return;
        }

        try {
            setIsSending(true);
            await onSend(contactMessage.trim());
            setContactMessage(""); // clear input after send
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className={styles.contactSection}>
            {title ?? "שאלות? הצעות? צרו איתנו קשר"}
            <br />
            <div className={styles.contactInlineForm}>
                <textarea
                    placeholder={placeholder ?? `כתבו כאן את ההודעה שלכם
כולל מספר טלפון לקשר מהיר בווטסאפ או כתובת מייל`}
                    value={contactMessage}
                    onChange={(e) => setContactMessage(e.target.value)}
                    className={styles.contactTextarea}
                />

                <button
                    type="button"
                    onClick={handleSend}
                    disabled={!contactMessage.trim() || isSending}
                    className={styles.contactButton}
                >
                    {isSending ? <div className={styles.loader}></div> : "שליחה"}
                </button>
            </div>
        </div>
    );
}
