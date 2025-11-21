"use client";

import "@/components/faq/faq.css"
import emailjs from "emailjs-com";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { errorToast, successToast } from "@/lib/toast";

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

    return (
        <div className="faq-container">
            <h1>שאלות נפוצות</h1>

            <details>
                <summary>איזה קישור צריך לשלוח למורים ואיך?</summary>
                <div className="answer">
                    מורי בית הספר הקבועים יכולים לקבל קישור אישי מתוך מסך המורים או להשתמש בקישור הבית־ספרי שנשלח מתוך מסך השיבוץ היומי ולבחור את שמם מתוך הרשימה.<br /><br />
                    עבור מורים חיצוניים (ממלאי מקום) יש להיכנס למסך מורים ממלאי מקום ולשלוח לכל אחד מהם את הקישור האישי שלו.
                    לכל ממלא מקום חיצוני יש קישור ייחודי.<br /><br />
                    מרגע שנשלח הקישור הוא נשאר תקף לתמיד ואין צורך לשלוח אותו שוב.
                </div>
            </details>


            <details>
                <summary>מה ההבדל בין מורה ממלא מקום (חיצוני) למורה מן המניין?</summary>
                <div className="answer">
                    מורה ממלא מקום רואה רק את המערכת האישית שלו ואינו נחשף לשינויים במערכת הבית ספרית.<br />
                    מורים מן המניין רואים גם את המערכת האישית וגם את השינויים במערכת הבית ספרית היומית.
                </div>
            </details>

            <details>
                <summary>אם אני רוצה שמורה ממלא מקום יוכל לראות גם את המערכת היומית הכללית של בית הספר, מה עליי לעשות?</summary>
                <div className="answer">
                    יש להסיר את מורה ממלא המקום מרשימת המורים החיצוניים ולהוסיף אותו לרשימת המורים הקבועים.
                    לאחר מכן הוא יוכל לצפות בכל העדכונים והמערכת היומית של בית הספר כמו כל מורה מן המניין.
                </div>
            </details>

            <details>
                <summary>כיצד ניתן לראות את המערכת כפי שהמורים רואים אותה?</summary>
                <div className="answer">
                    במסך שיבוץ יומי יש ללחוץ על כפתור התצוגה המקדימה בסמל העין.
                    במסך שייפתח תוצג המערכת היומית בדיוק כפי שהמורים רואים אותה.
                </div>
            </details>

            <details>
                <summary>כיצד ניתן לראות או לעדכן חומר לימוד שמורה חסר הזין במערכת?</summary>
                <div className="answer">
                    במסך שיבוץ יומי יש ללחוץ על כפתור התצוגה המקדימה בסמל העין.<br />
                    במסך שייפתח תוצג המערכת היומית ולחיצה על שם המורה בכותרת תפתח חלון שבו ניתן לצפות בחומר הלימוד שהוזן או לעדכן אותו במקרה הצורך.
                </div>
            </details>

            <details>
                <summary>אם אני מעדכן את המערכת אחרי הפרסום האם המורים יראו את העדכונים?</summary>
                <div className="answer">
                    כן.<br />
                    לאחר שהמערכת היומית פורסמה כל שינוי נוסף נשמר ומוצג למורים באופן אוטומטי ללא צורך בשום פעולה נוספת.<br />
                    אם המורים נמצאים באותו רגע בתוך מסך המערכות הם יקבלו הודעה שהמערכת השתנתה, ויתבקשו ללחוץ על כפתור הריענון כדי לראות את העדכונים.
                </div>
            </details>


            <details>
                <summary>האם צריך להתנתק בסיום השימוש?</summary>
                <div className="answer">
                    לא
                </div>
            </details>

            <details>
                <summary>האם אפשר להתקין את האתר כאפליקציה בטלפון כדי שתהיה לי גישה מהירה?</summary>
                <div className="answer">
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
                </div>

            </details>

            <details>
                <summary>טיפים נוספים?</summary>
                <div className="answer">
                    מדי פעם נעדכן כאן שאלות נפוצות ונוסיף סרטונים חדשים.<br />
                    <a href="https://www.youtube.com/watch?v=J85JD6Pn27I" target="_blank" rel="noopener noreferrer">
                        סרטון הדרכה קצר
                    </a>
                </div>
            </details>

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
