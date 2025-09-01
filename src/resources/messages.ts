const messages = {
    common: {
        invalid: "חסרים פרמטרים",
        serverError: "שגיאת מערכת פנימית. אנא נסו שוב"
    },
    auth: {
        accessDenied: "בעיה בהתחברות, אנא נסו שנית",

        unauthorized: "אין הרשאה. אנא התחבר כדי לגשת למידע זה",
        paramRequired: "פרמטר נדרש",
        login: {
            failed: "ההתחברות נכשלה",
            success: "Signed in successfully"
        },
        register: {
            failed: "ההרשמה נכשלה",
            emailInUse: "האימייל כבר בשימוש",
            invalid: "חסרים פרמטרים",
            success: "Registered successfully",
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
        error: "בעיה בטעינת רשימת המקצועות. אנא נסו שוב",
        createSuccess: "מקצוע נוסף בהצלחה",
        createError: "בעיה בהוספת מקצוע. אנא נסו שוב",
        deleteSuccess: "מקצוע נמחק בהצלחה",
        deleteError: "בעיה במחיקת המקצוע. אנא נסו שוב",
        invalid: "חסרים פרמטרים",
        updateSuccess: "מקצוע עודכן בהצלחה",
        updateError: "בעיה בעדכון המקצוע. אנא נסו שוב",
    },
    classes: {
        success: "רשימת כיתות נטענה בהצלחה",
        error: "בעיה בטעינת רשימת הכיתות. אנא נסו שוב",
        createSuccess: "כיתה נוספה בהצלחה",
        createError: "בעיה בהוספת כיתה. אנא נסו שוב",
        deleteSuccess: "כיתה נמחקה בהצלחה",
        deleteError: "בעיה במחיקת כיתה. אנא נסו שוב",
        invalid: "חסרים פרמטרים",
        updateSuccess: "כיתה עודכנה בהצלחה",
        updateError: "בעיה בעדכון כיתה. אנא נסו שוב",
    },
    annualSchedule: {
        success: "מערכת שנתית נטענה בהצלחה",
        error: "בעיה בטעינת המערכת השנתית. אנא נסו שוב",
        createSuccess: "השעה נוספה למערכת השנתית בהצלחה",
        createError: "בעיה בהוספת שעה למערכת השנתית. אנא נסו שוב",
        deleteSuccess: "השעה נמחקה במערכת השנתית בהצלחה",
        deleteError: "בעיה במחיקת שעה במערכת השנתית. אנא נסו שוב",
        updateSuccess: "השעה עודכנה במערכת השנתית בהצלחה",
        updateError: "בעיה בעדכון שעה במערכת השנתית. אנא נסו שוב",
    },
    dailySchedule: {
        success: "המערכת יומית נטענה בהצלחה",
        error: "בעיה בטעינת המערכת היומית. אנא נסו שוב",
        createSuccess: "שעה נוספה למערכת היומית בהצלחה",
        createError: "בעיה בהוספת שעה למערכת היומית. אנא נסו שוב",
        updateSuccess: "השעה עודכנה בהצלחה",
        updateError: "בעיה בעדכון שעה במערכת היומית. אנא נסו שוב",
        deleteSuccess: "העמודה נמחקה בהצלחה",
        deleteError: "בעיה במחיקת עמודה מהמערכת היומית. אנא נסו שוב",
        noScheduleFound: "המערכת היומית נטענה בהצלחה – לא נמצאו נתונים למורה ביום זה",
    },
    publish: {
        success: "המערכת היומית פורסמה",
        error: "בעיה בפרסום המערכת",
        alreadyPublished: "יום זה כבר פורסם",
    },
    //TODO
    share: {
        teacher: {
            title: "",
            text: "",
        },
        daily: {
            title: "",
            text: "",
        }
    }
}

export default messages;
