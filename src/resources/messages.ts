const messages = {
    common: {
        invalid: "חסרים פרמטרים",
        serverError: "שגיאת מערכת פנימית. אנא נסו שוב"
    },
    auth: {
        accessDenied: "נראה שהגעתם לאזור המיועד למנהלי המערכת. אם ברצונכם להצטרף או להתנסות בשיבוץ+, כיתבו לנו ל-shibutzplus@gmail.com",
        unauthorized: "אין הרשאה. יש להתחבר כדי לגשת למידע זה",
        paramRequired: "פרמטר נדרש",
        login: {
            failed: "ההתחברות נכשלה",
            success: "ההתחברות הצליחה"
        },
        register: {
            failed: "ההרשמה נכשלה",
            emailInUse: "האימייל כבר בשימוש",
            invalid: "חסרים פרמטרים",
            success: "ההרשמה הסתיימה בהצלחה",
            schoolExist: "בית הספר כבר קיים",
            schoolNotFound: "בית ספר לא נמצא",
            error: "שגיאה"
        }
    },
    school: {
        notFound: "בית הספר לא נמצא",
        success: "מידע על בית הספר נשלף בהצלחה",
    },
    teachers: {
        success: "רשימת מורים נטענה בהצלחה",
        error: "בעיה בטעינת רשימת המורים. אנא נסו שוב",
        createSuccess: "מורה נוסף בהצלחה",
        createError: "בעיה בהוספת מורה. אנא נסו שוב",
        deleteSuccess: "מורה נמחק בהצלחה",
        deleteError: "בעיה במחיקת מורה. אנא נסו שוב",
        invalid: "חסרים פרמטרים",
        updateSuccess: "מורה עודכן בהצלחה",
        updateError: "בעיה בעדכון המורה. אנא נסו שוב",
        needToSelect: "יש לבחור מורה מהרשימה"
    },
    subjects: {
        success: "רשימת מקצועות נטענה בהצלחה",
        error: "בעיה בטעינת רשימת המקצועות אנא נסו שוב",
        createSuccess: "מקצוע נוסף בהצלחה",
        createError: "בעיה בהוספת מקצוע אנא נסו שוב",
        deleteSuccess: "מקצוע נמחק בהצלחה",
        deleteError: "בעיה במחיקת המקצוע אנא נסו שוב",
        invalid: "חסרים פרמטרים",
        updateSuccess: "מקצוע עודכן בהצלחה",
        updateError: "בעיה בעדכון המקצוע אנא נסו שוב",
    },
    classes: {
        success: "רשימת כיתות/קבוצות נטענה בהצלחה",
        error: "בעיה בטעינת רשימת כיתות/קבוצות אנא נסו שוב",
        createClassSuccess: "כיתה נוספה בהצלחה",
        createGroupSuccess: "קבוצה נוספה בהצלחה",
        createError: "בעיה בהוספת כיתה/קבוצה אנא נסו שוב",
        deleteClassSuccess: "כיתה נמחקה בהצלחה",
        deleteGroupSuccess: "קבוצה נמחקה בהצלחה",
        deleteError: "בעיה במחיקת כיתה/קבוצה אנא נסו שוב",
        invalid: "חסרים פרמטרים",
        updateClassSuccess: "כיתה/קבוצה עודכנה בהצלחה",
        updateError: "בעיה בעדכון כיתה/קבוצה אנא נסו שוב",
    },
    annualSchedule: {
        success: "מערכת שנתית נטענה בהצלחה",
        error: "בעיה בטעינת המערכת השנתית אנא נסו שוב",
        createSuccess: "שעה נוספה למערכת בהצלחה",
        createError: "בעיה בהוספת שעה למערכת השנתית אנא נסו שוב",
        deleteSuccess: "שעה נמחקה מהמערכת",
        deleteError: "בעיה במחיקת שעה, אנא נסו שוב",
        updateSuccess: "השעה עודכנה בהצלחה",
        updateError: "בעיה בעדכון שעה, אנא נסו שוב",
    },
    dailySchedule: {
        success: "המערכת היומית נטענה בהצלחה",
        error: "בעיה בטעינת המערכת היומית אנא נסו שוב",
        createSuccess: "שעה נוספה למערכת היומית",
        createError: "בעיה בהוספת שעה למערכת היומית אנא נסו שוב",
        updateSuccess: "השעה עודכנה בהצלחה",
        updateError: "בעיה בעדכון שעה במערכת היומית אנא נסו שוב",
        deleteSuccess: "העמודה נמחקה",
        deleteError: "בעיה במחיקת עמודה במערכת היומית אנא נסו שוב",
        noScheduleFound: "לא נמצאו שעות לימוד למורה ביום זה",
        notPublished: "המערכת היומית לא פורסמה",
    },
    publish: {
        success: "המערכת היומית פורסמה וזמינה למורים",
        error: "בעיה בפרסום המערכת אנא נסו שוב",
    }
}

export default messages;
