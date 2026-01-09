"use client";

import "@/components/faq/faq.css";
import { useSession } from "next-auth/react";
import Icons from "@/style/icons";
import { motion } from "motion/react";
import { sendAdminContactEmail } from "@/app/actions/POST/sendEmailAction";
import ContactUsForm from "@/components/actions/ContactUsForm/ContactUsForm";

export default function FAQPage() {
    const { data: session } = useSession();

    const faqItems = [
        {
            question: "מה ההבדל בין מורי בית הספר למורים ממלאי מקום?",
            answer: (
                <>
                    <strong>מורים</strong> – מורי בית הספר הקבועים, בעלי מערכת שעות קבועה לאורך
                    השנה.
                    <br />
                    <strong>מורים ממלאי מקום</strong> – מורים ללא מערכת קבועה שאינם בצוות הקבוע,
                    המוזמנים לפי הצורך.
                    <br />
                    <br />
                    מורה ממלא מקום רואה רק את המערכת האישית שלו ואינו חשוף לשינויים במערכת הבית
                    ספרית.
                    <br />
                    אפשר לשנות את זה דרך הגדרות המערכת (<Icons.settings size={16} />
                    ).
                </>
            ),
        },
        {
            question: "איזה קישור צריך לשלוח למורים ואיך?",
            answer: (
                <>
                    <strong>מורי בית הספר</strong>
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
                    נכנסים למסך מורים ממלאי מקום ומפיקים לכל אחד מהם קישור אישי ייחודי ושולחים להם
                    את הקישור האישי.
                    <br />
                    <br />
                    מרגע שנשלח הקישור הוא נשאר תקף לתמיד ואין צורך לשלוח אותו שוב.
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
                    <br />
                    כאן ניתן לראות שכל השיבוצים בוצעו בצורה מלאה.
                </>
            ),
        },
        {
            question: "כיצד ניתן לראות או לעדכן חומר לימוד שמורה חסר הזין במערכת?",
            answer: (
                <>
                    במסך שיבוץ יומי - צפיה מקדימה/בדיקה, לחצו על כותרת העמודות עם שמות המורים.
                    <br />
                    במסך שייפתח תוצג המערכת היומית של המורה ושם ניתן לצפות בחומר הלימוד שהוזן או
                    לעדכן אותו במקרה הצורך.
                </>
            ),
        },
        {
            question: "אם אני מעדכן את המערכת אחרי הפרסום האם המורים יראו את העדכונים?",
            answer: (
                <>
                    כן.
                    <br />
                    לאחר שהמערכת היומית פורסמה כל שינוי נוסף נשמר ומוצג למורים באופן אוטומטי ללא
                    צורך בשום פעולה נוספת.
                </>
            ),
        },
        {
            question: "האם אפשר להתקין את האתר כאפליקציה בטלפון כדי שתהיה לי גישה מהירה?",
            answer: (
                <>
                    כן,
                    <br />
                    עבור משתמשי אנדרואיד ניתן להיעזר בסרטון הבא:
                    <br />
                    <a
                        href="https://www.youtube.com/shorts/1TkmsiS1ELg"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        https://www.youtube.com/shorts/1TkmsiS1ELg
                    </a>
                    <br />
                    1. פתחו את האתר בדפדפן כרום בטלפון
                    <br />
                    2. לחצו על שלוש הנקודות למעלה בצד ימין
                    <br />
                    3. בחרו באפשרות הוסף למסך הבית
                    <br />
                    4. אשרו את ההוספה – האייקון יופיע במסך האפליקציות
                    <br />
                    <br />
                    עבור משתמשי אייפון ניתן להיעזר בסרטון הבא:
                    <br />
                    <a
                        href="https://www.youtube.com/shorts/oWHuZoN571Y"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        https://www.youtube.com/shorts/oWHuZoN571Y
                    </a>
                    <br />
                    1. פתחו את האתר בדפדפן מסוג ספארי (באייפון התקנה עובדת רק מתוך ספארי)
                    <br />
                    2. לחצו על כפתור **שיתוף** (הריבוע עם החץ למעלה)
                    <br />
                    3. לחצו על כפתור **עוד**
                    <br />
                    3. גללו למטה ובחרו **הוסף למסך הבית**
                    <br />
                    4. אשרו את ההוספה – האייקון יופיע במסך האפליקציות
                    <br />
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
            <br />
            <div className="contact-section">
                שאלות? הצעות? צרו איתנו קשר
                <br />
                <ContactUsForm
                    onSend={async (message) => {
                        const adminName = session?.user?.name || "לא מחובר";
                        const adminEmail = session?.user?.email || "לא מחובר";
                        await sendAdminContactEmail({
                            adminName,
                            adminEmail,
                            message,
                        });
                    }}
                />
            </div>
        </div>
    );
}
