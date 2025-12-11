"use client";

import "@/components/faq/faq.css"
import emailjs from "emailjs-com";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { errorToast, successToast } from "@/lib/toast";
import Icons from "@/style/icons";
import { motion } from "motion/react";

export default function FAQPage() {
    const [contactMessage, setContactMessage] = useState<string>("");
    const [isSending, setIsSending] = useState<boolean>(false); // loading state
    const { data: session } = useSession();

    useEffect(() => {
        // Init EmailJS public key
        emailjs.init("54PCur6UIAdgGLnux");
    }, []);

    const handleSendContactEmail = async () => {
        if (!contactMessage.trim() || isSending) {
            return;
        }

        const adminName = session?.user?.name || "לא מחובר";
        const adminEmail = session?.user?.email || "לא מחובר";

        try {
            setIsSending(true);

            await emailjs.send(
                "service_m62x2wg",
                "template_umh68hy",
                {
                    adminName,
                    adminEmail,
                    message: contactMessage.trim(),
                },
                "54PCur6UIAdgGLnux"      // Public Key
            );

            successToast("ההודעה נשלחה בהצלחה. ניצור איתכם קשר בהקדם ✨", Infinity);
            setContactMessage(""); // clear input after send
        } catch (error: any) {
            const raw = error?.text || error?.message || error?.toString() || "";
            const shortError = raw.split(".")[0] + ".";
            errorToast(`אירעה שגיאה בשליחת ההודעה. יש להעביר את פרטי השגיאה למנהל בבית הספר כדי שיוכל לדווח למפתחי שיבוץ פלוס.\n\n${shortError || "לא זמינים"}`, Infinity);
        } finally {
            setIsSending(false);
        }
    };

    const faqItems = [
        {
            question: "מה ההבדל בין מורי בית הספר למורים ממלאי מקום?",
            answer: (
                <>
                    <strong>מורים</strong> – מורי בית הספר הקבועים, בעלי מערכת שעות קבועה לאורך השנה.<br />
                    <strong>מורים ממלאי מקום</strong> – מורים ללא מערכת קבועה, המוזמנים לפי צורך נקודתי.<br /><br />
                    מורה ממלא מקום רואה רק את המערכת האישית שלו ואינו נחשף לשינויים במערכת הבית ספרית.<br />
                    מורי בית הספר רואים גם את המערכת האישית וגם את השינויים במערכת הבית ספרית היומית.
                </>
            )
        },
        {
            question: "איזה קישור צריך לשלוח למורים ואיך?",
            answer: (
                <>
                    <strong>מורי בית הספר</strong><br />
                    אפשרות 1 – קישור בית־ספרי דרך מסך השיבוץ היומי:<br />
                    נכנסים למסך השיבוץ היומי, לוחצים על כפתור השיתוף (<Icons.share size={16} />) ושולחים את הקישור לכל המורים. כאשר המורה נכנס לקישור, הוא יבחר את שמו מתוך הרשימה.<br /><br />
                    אפשרות 2 – קישור אישי דרך מסך מורים:<br />
                    נכנסים למסך המורים ומפיקים קישור אישי (כפתור השיתוף <Icons.share size={16} />) עבור כל מורה בנפרד. שולחים לכל מורה את הקישור האישי שלו. כאשר המורה נכנס לקישור האישי, המערכת נפתחת ישירות ללא צורך בבחירת שם.<br /><br />

                    <strong>מורים חיצוניים (ממלאי מקום)</strong><br />
                    נכנסים למסך מורים ממלאי מקום ומפיקים לכל אחד מהם קישור אישי ייחודי. שולחים לכל ממלא מקום את הקישור האישי שלו.
                    <br /><br />
                    מרגע שנשלח הקישור הוא נשאר תקף לתמיד ואין צורך לשלוח אותו שוב.
                </>
            )
        },
        {
            question: "במסך שיבוץ יומי, אילו קטגוריות מופיעות בשדה ממלא המקום?",
            answer: (
                <>
                    <strong>מורה נוסף בשיעור:</strong> מורה נוסף המלמד יחד עם המורה החסר באותה כיתה ובאותה שעה.<br />
                    <strong>מורים למילוי מקום:</strong> רשימת המורים המוגדרים כממלאי מקום.<br />
                    <strong>מורים ללא מערכת:</strong> מורים ללא מערכת קבועה.<br />
                    <strong>מורים פנויים:</strong> מורים המלמדים ביום זה ופנויים בשעה הנדרשת.<br />
                    <strong>מורים בקבוצת עבודה:</strong> מורים בקבוצה כגון פרטני, שהייה, מפגש צוות ועוד...<br />
                    <strong>מורים מלמדים בכיתה אחרת:</strong> מורים המלמדים בשעה זו.<br />
                    <strong>לא התחילו/סיימו את היום:</strong> מורים אשר מלמדים היום אך טרם הגיעו או כבר סיימו את יום העבודה.<br />
                    <strong>ביום חופשי:</strong> מורים שאינם מלמדים ביום זה.<br />
                    <strong>אפשרויות נוספות:</strong> סימון מצבים מיוחדים כגון משוחררים הביתה, טיול, הצגה או כל אפשרות אחרת.<br /><br />
                    <div style={{ marginRight: "20px" }}>
                        <ul>
                            <li>ניתן גם לכתוב טקסט חופשי.</li>
                            <li>בעת הקלדה, הרשימה מסוננת בהתאם לטקסט שהוזן.</li>
                            <li>ניתן לפתוח או לסגור את הקבוצות לפי הצורך.</li>
                            <li>שימו לב: הקטגוריות מוצגות בהתאם לשעה שנבחרה ולמצב המורים בפועל באותה שעה.</li>
                        </ul>
                    </div>
                </>
            )
        },
        {
            question: "כיצד ניתן לבדוק את המערכת ולראות אותה כפי שהמורים רואים אותה?",
            answer: (
                <>
                    במסך שיבוץ יומי יש ללחוץ על כפתור התצוגה המקדימה (<Icons.eye size={22} />).<br />
                    במסך שייפתח תוצג המערכת היומית כפי שהמורים רואים.<br />
                    כאן ניתן לראות שכל השיבוצים בוצעו בצורה מלאה.
                </>
            )
        },
        {
            question: "כיצד ניתן לראות או לעדכן חומר לימוד שמורה חסר הזין במערכת?",
            answer: (
                <>
                    במסך שיבוץ יומי - צפיה מקדימה/בדיקה, לחצו על כותרת העמודות עם שמות המורים.<br />
                    במסך שייפתח תוצג המערכת היומית של המורה ושם ניתן לצפות בחומר הלימוד שהוזן או לעדכן אותו במקרה הצורך.
                </>
            )
        },
        {
            question: "אם אני מעדכן את המערכת אחרי הפרסום האם המורים יראו את העדכונים?",
            answer: (
                <>
                    כן.<br />
                    לאחר שהמערכת היומית פורסמה כל שינוי נוסף נשמר ומוצג למורים באופן אוטומטי ללא צורך בשום פעולה נוספת.
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
                </>
            )
        }
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
