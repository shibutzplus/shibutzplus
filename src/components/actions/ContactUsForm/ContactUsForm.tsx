"use client";

import React, { useState } from "react";
import Loading from "@/components/loading/Loading/Loading";
import styles from "./ContactUsForm.module.css";
import { errorToast, successToast } from "@/lib/toast";

interface ContactUsFormProps {
    onSend: (message: string) => Promise<void>;
    onSuccess?: () => void;
    placeholder?: string;
    submitText?: string;
    buttonVariant?: "outline" | "filled";
    className?: string;
}

const ContactUsForm: React.FC<ContactUsFormProps> = ({
    onSend,
    onSuccess,
    placeholder = `כתבו כאן את ההודעה שלכם
כולל מספר טלפון לקשר מהיר בווטסאפ או כתובת מייל`,
    submitText = "שליחה",
    buttonVariant = "outline",
    className = "",
}) => {
    const [message, setMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async () => {
        if (!message.trim()) return;

        setIsLoading(true);
        try {
            await onSend(message);
            successToast("ההודעה נשלחה בהצלחה. ניצור איתכם קשר בהקדם ✨", Infinity);
            setMessage(""); // Clear content
            if (onSuccess) onSuccess();
        } catch (error: any) {
            const raw = error?.text || error?.message || error?.toString() || "";
            const shortError = raw.split(".")[0] + ".";
            errorToast(
                `אירעה שגיאה בשליחת ההודעה. יש להעביר את פרטי השגיאה למנהל בבית הספר כדי שיוכל לדווח למפתחי שיבוץ פלוס.\n\n${shortError || "לא זמינים"
                }`,
                Infinity,
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={`${styles.container} ${className}`}>
            <textarea
                className={styles.textarea}
                placeholder={placeholder}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                dir="rtl"
            />
            <button
                className={`${styles.submitButton} ${buttonVariant === "filled" ? styles.filled : ""
                    }`}
                onClick={handleSubmit}
                disabled={isLoading || !message.trim()}
            >
                {isLoading ? <Loading size="S" /> : submitText}
            </button>
        </div>
    );
};

export default ContactUsForm;
