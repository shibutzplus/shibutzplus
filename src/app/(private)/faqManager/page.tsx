"use client";

import "@/components/faq/faq.css";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { errorToast, successToast } from "@/lib/toast";
import Icons from "@/style/icons";
import { motion } from "motion/react";
import { sendAdminContactEmail } from "@/app/actions/POST/sendEmailAction";

export default function FAQPage() {
    const [contactMessage, setContactMessage] = useState<string>("");
    const [isSending, setIsSending] = useState<boolean>(false);
    const { data: session } = useSession();

    const handleSendContactEmail = async () => {
        if (!contactMessage.trim() || isSending) {
            return;
        }

        const adminName = session?.user?.name || "לא מחובר";
        const adminEmail = session?.user?.email || "לא מחובר";

        try {
            setIsSending(true);

            await sendAdminContactEmail({
                adminName,
                adminEmail,
                message: contactMessage.trim(),
            });

            successToast("ההודעה נשלחה בהצלחה. ניצור איתכם קשר בהקדם ✨", Infinity);
            setContactMessage(""); // clear input after send
        } catch (error: unknown) {
            const err = error as any;
            const raw = err?.text || err?.message || err?.toString() || "";
            const shortError = raw.split(".")[0] + ".";
            errorToast(
                `אירעה שגיאה בשליחת ההודעה. יש להעביר את פרטי השגיאה למנהל בבית הספר כדי שיוכל לדווח למפתחי שיבוץ פלוס.\n\n${shortError || "לא זמינים"}`,
                Infinity,
            );
        } finally {
            setIsSending(false);
        }
    };

    const faqItems = [
        {
            question: "איזה קישור צריך לשלוח למורים ואיך?",
            answer: (
                <>
                    <strong>מורי בית הספר</strong>
                    <br />
                    מורי בית הספר הקבועים, בעלי מערכת שעות קבועה לאורך השנה.
                    <br />
                    <br />
                    אפשרות 1 – קישור בית־ספרי דרך מסך השיבוץ היומי:
                    <br />
                    נכנסים למסך השיבוץ היומי, לוחצים על כפתור השיתוף (<Icons.share size={16} />)
                    ושולחים את הקישור לכל המורים. כאשר המורה נכנס לקישור, הוא יבחר את שמו מתוך
                    הרשימה.
                    <br />
                    <br />
                    אפשרות 2 – קישור אישי דרך מסך מורים:
                    <br />
                    נכנסים למסך המורים ומפיקים קישור אישי (כפתור השיתוף <Icons.share size={16} />)
                    עבור כל מורה בנפרד. שולחים לכל מורה את הקישור האישי שלו. כאשר המורה נכנס לקישור
                    האישי, המערכת נפתחת ישירות ללא צורך בבחירת שם.
                    <br />
                    <br />
                    <strong>מורים למילוי מקום</strong>
                    <br />
                    מורים ללא מערכת קבועה שאינם בצוות הקבוע, המוזמנים לפי הצורך.
                    <br />
                    יכולים להתחבר רק דרך קישור אישי.<br />
                    נכנסים למסך מורים ממלאי מקום, לוחצים על כפתור השיתוף ושולחים להם
                    את הקישור האישי.
                    <br />
                    מורה ממלא מקום רואה רק את המערכת האישית שלו ואינו חשוף לשינויים במערכת הבית ספרית.
                    אפשר לשנות את זה דרך הגדרות המערכת (<Icons.settings size={16} />).
                    <br />
                    <br />
                    <strong>מרגע שנשלח הקישור הוא נשאר תקף לתמיד ואין צורך לשלוח אותו שוב.</strong>
                </>
            ),
        },
        {
            question: "במסך שיבוץ יומי, אילו קטגוריות יכולות להופיע בשדה ממלא המקום?",
            answer: (
                <>
                    <strong>מורה נוסף בשיעור:</strong> מורה נוסף המלמד יחד עם המורה החסר באותה כיתה
                    ובאותה שעה.
                    <br />
                    <strong>מורים למילוי מקום:</strong> רשימת המורים המוגדרים כממלאי מקום.
                    <br />
                    <strong>מורים ללא מערכת:</strong> מורים ללא מערכת קבועה.
                    <br />
                    <strong>מורים פנויים:</strong> מורים המלמדים ביום זה ופנויים בשעה הנדרשת.
                    <br />
                    <strong>מורים בקבוצת עבודה:</strong> מורים בקבוצה כגון פרטני, שהייה, מפגש צוות
                    ועוד...
                    <br />
                    <strong>מורים מלמדים בכיתה אחרת:</strong> מורים המלמדים בשעה זו.
                    <br />
                    <strong>לא התחילו/סיימו את היום:</strong> מורים אשר מלמדים היום אך טרם הגיעו או
                    כבר סיימו את יום העבודה.
                    <br />
                    <strong>ביום חופשי:</strong> מורים שאינם מלמדים ביום זה.
                    <br />
                    <br />
                    <div style={{ marginRight: "20px" }}>
                        <ul>
                            <li>אפשר לכתוב גם טקסט חופשי.</li>
                            <li>בעת הקלדה, הרשימה מסוננת בהתאם לטקסט שהוזן.</li>
                            <li>הקטגוריות מוצגות בהתאם לשעה שנבחרה ולמצב המורים בפועל באותה שעה.</li>
                        </ul>
                    </div>
                </>
            ),
        },
        {
            question: "כיצד ניתן לבדוק את המערכת ולראות אותה כפי שהמורים רואים אותה?",
            answer: (
                <>
                    במסך שיבוץ יומי יש ללחוץ על כפתור התצוגה המקדימה (<Icons.eye size={22} />
                    ).
                    <br />
                    במסך שייפתח תוצג המערכת היומית כפי שהמורים רואים.
                </>
            ),
        },
        {
            question: "כיצד ניתן לראות או לעדכן חומר לימוד שמורה חסר הזין במערכת?",
            answer: (
                <>
                    במסך שיבוץ יומי - צפיה מקדימה, לחצו על כותרת העמודות עם שמות המורים.
                    <br />
                    במסך שייפתח תוצג המערכת היומית של המורה ושם ניתן לצפות בחומר הלימוד שהוזן או
                    לעדכן אותו במידת הצורך.
                </>
            ),
        },
        {
            question: "אם אני מעדכן את המערכת אחרי הפרסום האם המורים יראו את העדכונים?",
            answer: (
                <>
                    כן.
                    <br />
                    לאחר שהמערכת היומית פורסמה כל שינוי נוסף מוצג למורים באופן אוטומטי ללא
                    צורך בשום פעולה נוספת.
                </>
            ),
        },
    ];

    return (
        <div className="faq-container">
            <h1>שאלות נפוצות</h1>

            {faqItems.map((item, index) => (
                <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                        duration: 0.5,
                        delay: index * 0.1,
                        ease: "easeOut",
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
                שאלות? הצעות? צרו איתנו קשר
                <br />
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
