"use server";

/**
 * Another option without 2FA is Resend package
 */

export const sendEmail = async (
    to: string,
    subject: string,
    message: string,
    senderName: string,
    senderEmail: string,
) => {
    try {
        const response = await fetch("/api/send-email", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                to,
                subject,
                message,
                senderName,
                senderEmail,
            }),
        });

        return response.ok ? true : false;
    } catch (error) {
        console.error("Email error:", error);
        return false;
    }
};
