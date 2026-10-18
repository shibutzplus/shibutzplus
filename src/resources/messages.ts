import { TeacherRoleValues } from "@/models/types/teachers";

export const getDuplicateTeacherMessage = (
    name: string,
    existingRole?: string,
    targetRole?: string,
): string => {
    if (existingRole && existingRole !== targetRole) {
        if (existingRole === TeacherRoleValues.SUBSTITUTE) {
            return `"${name}" קיים/ת ברשימת המורים למילוי מקום.`;
        }
        if (existingRole === TeacherRoleValues.REGULAR) {
            return `"${name}" קיים/ת ברשימת המורים מן המניין.`;
        }
        if (existingRole === TeacherRoleValues.STAFF) {
            return `"${name}" קיים/ת ברשימת אנשי הצוות.`;
        }
    }
    return `"${name}" כבר ברשימה.`;
};

const messages = {
    common: {
        invalid: "חסרים פרמטרים",
        serverError: "בעיה בשליפת הנתונים. מומלץ לרענן את המסך ולנסות שוב"
    },
    auth: {
        accessDenied: "נראה שהגעתם לאזור המיועד למנהלי המערכת. אם ברצונכם להצטרף או להתנסות בשיבוץ+, כיתבו לנו ל-contact@shibutzplus.com",
        unauthorized: "אין הרשאה. יש להתחבר כדי לגשת למידע זה",
        paramRequired: "פרמטר נדרש",
        login: {
            failed: "ההתחברות נכשלה",
            success: "ההתחברות הצליחה",
            invalidCredentials: "אימייל או סיסמה שגויים",
            adminOnly: "כניסה זו מיועדת למנהלי מערכת בלבד"
        },
        register: {
            failed: "ההרשמה נכשלה",
            emailInUse: "האימייל כבר בשימוש",
            invalid: "חסרים פרמטרים",
            success: "ההרשמה הסתיימה בהצלחה",
            error: "שגיאה"
        }
    },
    school: {
        notFound: "בית הספר לא נמצא",
        success: "מידע על בית הספר נשלף בהצלחה",
    },
    teachers: {
        success: "רשימת מורים נטענה בהצלחה",
        error: "בעיה בטעינת רשימת המורים. מומלץ לרענן את המסך ולנסות שוב",
        createSuccess: "מורה נוסף בהצלחה",
        createError: "בעיה בהוספת מורה. מומלץ לרענן את המסך ולנסות שוב",
        deleteSuccess: "מורה נמחק בהצלחה",
        deleteError: "בעיה במחיקת מורה. מומלץ לרענן את המסך ולנסות שוב",
        invalid: "חסרים פרמטרים",
        updateSuccess: "מורה עודכן בהצלחה",
        updateError: "בעיה בעדכון המורה. מומלץ לרענן את המסך ולנסות שוב",
        needToSelect: "יש לבחור מורה מהרשימה",
        duplicate: getDuplicateTeacherMessage,
    },
    subjects: {
        success: "רשימת מקצועות נטענה בהצלחה",
        error: "בעיה בטעינת רשימת המקצועות. מומלץ לרענן את המסך ולנסות שוב",
        createSuccess: "מקצוע נוסף בהצלחה",
        createError: "בעיה בהוספת מקצוע. מומלץ לרענן את המסך ולנסות שוב",
        deleteSuccess: "מקצוע נמחק בהצלחה",
        deleteError: "בעיה במחיקת המקצוע. מומלץ לרענן את המסך ולנסות שוב",
        invalid: "חסרים פרמטרים",
        updateSuccess: "מקצוע עודכן בהצלחה",
        updateError: "בעיה בעדכון המקצוע. מומלץ לרענן את המסך ולנסות שוב",
    },
    classes: {
        success: "רשימת כיתות/קבוצות נטענה בהצלחה",
        error: "בעיה בטעינת רשימת כיתות/קבוצות. מומלץ לרענן את המסך ולנסות שוב",
        createClassSuccess: "כיתה נוספה בהצלחה",
        createError: "בעיה בהוספת כיתה/קבוצה. מומלץ לרענן את המסך ולנסות שוב",
        deleteClassSuccess: "כיתה נמחקה בהצלחה",
        deleteGroupSuccess: "קבוצה נמחקה בהצלחה",
        deleteError: "בעיה במחיקת כיתה/קבוצה. מומלץ לרענן את המסך ולנסות שוב",
        invalid: "חסרים פרמטרים",
        updateClassSuccess: "כיתה/קבוצה עודכנה בהצלחה",
        updateError: "בעיה בעדכון כיתה/קבוצה. מומלץ לרענן את המסך ולנסות שוב",
    },
    annualSchedule: {
        success: "מערכת שנתית נטענה בהצלחה",
        error: "בעיה בטעינת המערכת השנתית. מומלץ לרענן את המסך ולנסות שוב",
        createSuccess: "שעה נוספה למערכת בהצלחה",
        createError: "בעיה בהוספת שעה למערכת השנתית. מומלץ לרענן את המסך ולנסות שוב",
        deleteSuccess: "שעה נמחקה מהמערכת",
        deleteError: "בעיה במחיקת שעה. מומלץ לרענן את המסך ולנסות שוב",
        updateSuccess: "השעה עודכנה בהצלחה",
    },
    dailySchedule: {
        success: "המערכת היומית נטענה בהצלחה",
        error: "בעיית תקשורת רגעית בטעינת המערכת היומית. מומלץ לרענן את המסך ולנסות שוב",
        createSuccess: "שעה נוספה למערכת היומית",
        createError: "בעיית תקשורת רגעית בהוספת שעה למערכת היומית. מומלץ לרענן את המסך ולנסות שוב",
        updateSuccess: "השעה עודכנה בהצלחה",
        updateError: "בעיית תקשורת רגעית בעדכון שעה במערכת היומית. מומלץ לרענן את המסך ולנסות שוב",
        deleteSuccess: "העמודה נמחקה",
        deleteError: "בעיית תקשורת רגעית במחיקת עמודה במערכת היומית. מומלץ לרענן את המסך ולנסות שוב",
        noScheduleFound: "לא נמצאו שעות לימוד למורה ביום זה",
        notPublished: "המערכת היומית לא פורסמה",
        autoAssignNoSlots: "לא נמצאו שעות לימוד ללא שיבוץ",
        autoAssignStep1: "⚖️ מחשב דירוגי התאמה והעדפות פדגוגיות...",
        autoAssignStep2: "✨ מבצע שיבוצים אופטימליים...",
        autoAssignNoCandidates: "לא נמצאו שיבוצים מתאימים",
        autoAssignError: "השיבוץ האוטומטי לא הושלם, מומלץ להמשיך בשיבוץ ידני",
        teacherScheduledForGuard: (name: string) => `שימו לב ש${name} משובץ/ת לתורנות היום`,
        teacherNotTeachingToday: (name: string) => `שימו לב שאין ל${name} שעות לימוד להיום`,
        guardRecurringSuccess: "התורנות שובצה באופן קבוע עד סוף השנה",
        guardRecurringError: "ההגדרה כתורנות חוזרת לא הושלמה. מומלץ לרענן את המסך ולנסות שוב",
    },
    publish: {
        success: "המערכת היומית פורסמה וזמינה למורים",
        error: "בעיה בפרסום המערכת. מומלץ לרענן את המסך ולנסות שוב",
    },
    system: {
        versionUpdate: "הדף יתרענן אוטומטית בעוד מספר שניות לצורך עדכון גרסה, המתינו לריענון ואז אפשר להמשיך כרגיל...",
    }
}

export default messages;
