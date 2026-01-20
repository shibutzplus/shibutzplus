"use client";

import "@/components/faq/faq.css";
import { useSession } from "next-auth/react";
import { errorToast, successToast } from "@/lib/toast";
import Icons from "@/style/icons";
import { sendAdminContactEmail } from "@/app/actions/POST/sendEmailAction";
import FaqContent from "@/components/faq/FaqContent/FaqContent";
import { FAQ_MANAGER_ITEMS } from "@/resources/faq";
import React from "react";

export default function FAQPage() {
    const { data: session } = useSession();

    const handleSendContactEmail = async (message: string) => {
        const adminName = session?.user?.name || "לא מחובר";
        const adminEmail = session?.user?.email || "לא מחובר";

        try {
            await sendAdminContactEmail({
                adminName,
                adminEmail,
                message,
            });

            successToast("ההודעה נשלחה בהצלחה. ניצור איתכם קשר בהקדם ✨", Infinity);
        } catch (error: unknown) {
            const err = error as any;
            const raw = err?.text || err?.message || err?.toString() || "";
            const shortError = raw.split(".")[0] + ".";
            errorToast(
                `אירעה שגיאה בשליחת ההודעה. יש להעביר את פרטי השגיאה למנהל בבית הספר כדי שיוכל לדווח למפתחי שיבוץ פלוס.\n\n${shortError || "לא זמינים"}`,
                Infinity,
            );
            throw error; // Let ContactUs handle isSending if needed, but it's fine
        }
    };

    const faqItems = FAQ_MANAGER_ITEMS.map(item => ({
        question: item.question,
        answer: item.answer()
    }));

    return (
        <FaqContent 
            faqItems={faqItems} 
            onSendContact={handleSendContactEmail} 
        />
    );
}
