"use client";

import "@/components/faq/faq.css"
import emailjs from "emailjs-com";
import { useEffect, useState } from "react";
import { getStorageTeacher } from "@/lib/localStorage";
import { errorToast, successToast } from "@/lib/toast";
import { motion } from "motion/react";

export default function FAQPage() {
    const [teacherLink, setTeacherLink] = useState<string>("");
    const [contactMessage, setContactMessage] = useState<string>("");
    const [isSending, setIsSending] = useState<boolean>(false); // loading state

    useEffect(() => {
        // Get teacher info from localStorage
        const teacher = getStorageTeacher();
        if (teacher?.id && teacher?.schoolId) {
            setTeacherLink(`https://shibutzplus.com/teacher-portal/${teacher.schoolId}/${teacher.id}`);
        }
    }, []);

    useEffect(() => {
        // Init EmailJS public key
        emailjs.init("54PCur6UIAdgGLnux");
    }, []);

    const handleSendContactEmail = async () => {
        if (!contactMessage.trim() || isSending) {
            // Do nothing if message is empty or already sending
            return;
        }

        const teacher = getStorageTeacher();
        const schoolCode = teacher?.schoolId || "לא צוין";
        const teacherCode = teacher?.id || "לא צוין";
        const teacherName = teacher?.name || "לא צוין";

        try {
            setIsSending(true);

            await emailjs.send(
                "service_m62x2wg",
                "template_e926ovf",
                {
                    schoolCode,
                    teacherCode,
                    teacherName,
                    message: contactMessage.trim(),
                },
                "54PCur6UIAdgGLnux"      // Public Key
            );

            successToast("ההודעה נשלחה בהצלחה. ניצור איתכם קשר בהקדם ✨", Infinity);
            setContactMessage(""); // clear input after send
        } catch (error: any) {
            const raw = error?.text || error?.message || error?.toString() || "";
            const shortError = raw.split(".")[0] + ".";
            errorToast(
                `אירעה שגיאה בשליחת ההודעה. יש להעביר את פרטי השגיאה למנהל בבית הספר כדי שיוכל לדווח למפתחי שיבוץ פלוס.\n\n${shortError || "לא זמינים"
                }`,
                Infinity
            );
        } finally {
            setIsSending(false);
        }
    };

    const faqItems = [
        {
            question: "האם ניתן להוסיף קישור חיצוני בשדה חומר הלימוד?",
            answer: (
                <>
                    כן!<br />
                    יש להדביק את הכתובת וללחוץ Enter בסיום כדי שהוא יזוהה.<br />
                    כאשר הקישור מזוהה, הוא יופיע בצבע כחול.
                </>
            )
        },
        {
            question: "האם אפשר לקבל קישור ישיר למשתמש שלי בלי שאצטרך להזדהות כל פעם מחדש?",
            answer: (
                <>
                    כן!<br />
                    אפשר להשתמש בקישור האישי המצורף, והוא ייפתח ישירות ללא צורך במסך ההזדהות. הקישור מיועד לשימוש שלך בלבד ואין להעבירו לאחרים.
                    {teacherLink ? (
                        <div className="teacher-link">
                            <a href={teacherLink} target="_blank" rel="noopener noreferrer">
                                <strong>קישור אישי</strong>
                            </a>
                        </div>
                    ) : (
                        <p>כדי לראות את הקישור הייחודי שלך, יש להתחבר קודם למערכת</p>
                    )}
                </>
            )
        },
        {
            question: "האם צריך להתנתק בסיום השימוש?",
            answer: (
                <>
                    לא
                </>
            )
        },
        {
            question: "האם אפשר להתקין את האתר כאפליקציה בטלפון כדי שתהיה לי גישה מהירה?",
            answer: (
                <>
                    כן,<br />
                    עבור משתמשי אנדרואיד ניתן להיעזר בסרטון הבא:<br />
                    <a href="https://www.youtube.com/shorts/1TkmsiS1ELg" target="_blank" rel="noopener noreferrer">
                        https://www.youtube.com/shorts/1TkmsiS1ELg
                    </a>
                    <br />
                    1. פתחו את האתר בדפדפן כרום בטלפון<br />
                    2. לחצו על שלוש הנקודות למעלה בצד ימין<br />
                    3. בחרו באפשרות הוסף למסך הבית<br />
                    4. אשרו את ההוספה – האייקון יופיע במסך האפליקציות<br />
                    <br />
                    עבור משתמשי אייפון ניתן להיעזר בסרטון הבא:<br />
                    <a href="https://www.youtube.com/shorts/oWHuZoN571Y" target="_blank" rel="noopener noreferrer">
                        https://www.youtube.com/shorts/oWHuZoN571Y
                    </a>
                    <br />
                    1. פתחו את האתר בדפדפן מסוג ספארי (באייפון התקנה עובדת רק מתוך ספארי)<br />
                    2. לחצו על כפתור **שיתוף** (הריבוע עם החץ למעלה)<br />
                    3. לחצו על כפתור **עוד**<br />
                    3. גללו למטה ובחרו **הוסף למסך הבית**<br />
                    4. אשרו את ההוספה – האייקון יופיע במסך האפליקציות<br />
                    <br />
                    מומלץ להתחבר עם הקישור האישי שלכם.
                </>
            )
        }
    ];

    return (
        <div className="faq-container">
            <h1>שאלות נפוצות</h1>
            <p className="subtitle">ריכזנו עבורכם את התשובות לכל השאלות החשובות</p>

            {faqItems.map((item, index) => (
                <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                        duration: 0.5,
                        delay: index * 0.1,
                        ease: "easeOut"
                    }}
                >
                    <details>
                        <summary>{item.question}</summary>
                        <div className="answer">{item.answer}</div>
                    </details>
                </motion.div>
            ))}

            <br />
            <div className="contact-section">
                שאלות? הצעות? צרו איתנו קשר<br />

                <div className="contact-inline-form">
                    <textarea
                        placeholder={`כתבו כאן את ההודעה שלכם
כולל מספר טלפון לקשר מהיר בווטסאפ או כתובת מייל`}
                        value={contactMessage}
                        onChange={(e) => setContactMessage(e.target.value)}
                        className="contact-textarea"
                    />

                    <button
                        type="button"
                        onClick={handleSendContactEmail}
                        disabled={!contactMessage.trim() || isSending}
                    >
                        {isSending ? <div className="loader"></div> : "שליחה"}
                    </button>
                </div>
            </div>

        </div>
    );
}
