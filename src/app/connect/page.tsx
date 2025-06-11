"use client";

import React, { useState } from "react";
import Link from "next/link";
import styles from "./connect.module.css";
import routePath from "../../routes";
import { sendWhatsApp } from "@/lib/contact/whatsapp";
import { sendEmail } from "@/lib/contact/email";

const ConnectPage: React.FC = () => {
    const [isLoading, setIsLoading] = useState(false);

    const handleSendEmail = async () => {
        setIsLoading(true);
        const result = await sendEmail(
            "shibutzplus@gmail.com",
            "new subject",
            "new message",
            "new name",
            "new email",
        );
        setIsLoading(false);

        if (!result) {
            alert("Failed to send email");
        }
    };

    const handleSendBoth = async () => {
        setIsLoading(true);
        const result = await sendEmail(
            "shibutzplus@gmail.com",
            "new subject",
            "new message",
            "new name",
            "new email",
        );
        setIsLoading(false);

        if (!result) {
            alert("Failed to send email");
        }

        sendWhatsApp("+972523454596", "new message");
    };

    return (
        <div className={styles.container}>
            <div className={styles.content}>
                <h1 className={styles.title}>Connect</h1>
                <div className={styles.buttonsContainer}>
                    <button
                        className={styles.connectButton}
                        onClick={handleSendEmail}
                        disabled={isLoading}
                    >
                        {isLoading ? "Sending..." : "Send Email - not working"}
                    </button>
                    <button
                        className={styles.connectButton}
                        onClick={() => sendWhatsApp("+972523454596", "new message")}
                        disabled={isLoading}
                    >
                        Send WhatsApp
                    </button>
                    <button
                        className={styles.connectButton}
                        onClick={handleSendBoth}
                        disabled={isLoading}
                    >
                        {isLoading ? "Sending..." : "Send Both - not working"}
                    </button>
                </div>

                <div className={styles.navigation}>
                    <Link href={routePath.dashboard.p} className={styles.navLink}>
                        Back to Dashboard
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ConnectPage;
