"use client";

import "@/components/faq/faq.css";
import { useEffect, useState } from "react";
import { getStorageTeacher } from "@/lib/localStorage";
import { errorToast, successToast } from "@/lib/toast";
import { sendTeacherContactEmail } from "@/app/actions/POST/sendEmailAction";
import router from "@/routes";
import FaqContent from "@/components/faq/FaqContent/FaqContent";
import { FAQ_TEACHERS_ITEMS } from "@/resources/faq";

export default function FAQPage() {
    const [teacherLink, setTeacherLink] = useState<string>("");

    useEffect(() => {
        // Get teacher info from localStorage
        const teacher = getStorageTeacher();
        if (teacher?.id && teacher?.schoolId) {
            setTeacherLink(
                `${window.location.origin}${router.teacherMaterialPortal.p}/${teacher.schoolId}/${teacher.id}`,
            );
        }
    }, []);

    const handleSendContactEmail = async (message: string) => {
        const teacher = getStorageTeacher();
        const schoolCode = teacher?.schoolId || "לא צוין";
        const teacherCode = teacher?.id || "לא צוין";
        const teacherName = teacher?.name || "לא צוין";

        try {
            await sendTeacherContactEmail({
                schoolCode,
                teacherCode,
                teacherName,
                message,
            });

            successToast("ההודעה נשלחה בהצלחה. ניצור איתכם קשר בהקדם ✨", Infinity);
        } catch (error: any) {
            const raw = error?.text || error?.message || error?.toString() || "";
            const shortError = raw.split(".")[0] + ".";
            errorToast(
                `אירעה שגיאה בשליחת ההודעה. יש להעביר את פרטי השגיאה למנהל בבית הספר כדי שיוכל לדווח למפתחי שיבוץ פלוס.\n\n${shortError || "לא זמינים"
                }`,
                Infinity,
            );
            throw error;
        }
    };

    const faqItems = FAQ_TEACHERS_ITEMS(teacherLink).map(item => ({
        question: item.question,
        answer: item.answer()
    }));

    return (
        <FaqContent 
            subtitle="ריכזנו עבורכם את התשובות לכל השאלות החשובות"
            faqItems={faqItems} 
            onSendContact={handleSendContactEmail} 
        />
    );
}
