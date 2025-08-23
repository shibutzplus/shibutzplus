const messages = {
    common: {
        invalid: "חסרים פרמטרים",
        serverError: "שגיאת שרת פנימית. אנא נסה שוב מאוחר יותר"
    },
    auth: {
        accessDenied: "שגיאה בהתחברות, אנא נסו שנית",

        unauthorized: "אין הרשאה. אנא התחבר כדי לגשת למידע זה",
        paramRequired: "פרמטר נדרש",
        login: {
            failed: "כניסה נכשלה",
            success: "Signed in successfully"
        },
        register: {
            failed: "הרשמה נכשלה",
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
        success: "מידע בית ספר נשלף בהצלחה",
    },
    teachers: {
        success: "רשימת מורים נשלפה בהצלחה",
        error: "שגיאה בשליפת רשימת המורים. אנא נסה שוב מאוחר יותר",
        createSuccess: "מורה נוסף בהצלחה",
        createError: "שגיאה בהוספת מורה. אנא נסה שוב מאוחר יותר",
        deleteSuccess: "מורה נמחק בהצלחה",
        deleteError: "שגיאה במחיקת מורה. אנא נסה שוב מאוחר יותר",
        invalid: "חסרים פרמטרים",
        updateSuccess: "מורה עודכן בהצלחה",
        updateError: "שגיאה בעדכון המורה. אנא נסה שוב מאוחר יותר",
        needToSelect: "יש לבחור מורה מהרשימה"
    },
    subjects: {
        success: "רשימת מקצועות נשלפה בהצלחה",
        error: "שגיאה בשליפת רשימת המקצועות. אנא נסה שוב מאוחר יותר",
        createSuccess: "מקצוע נוסף בהצלחה",
        createError: "שגיאה בהוספת מקצוע. אנא נסה שוב מאוחר יותר",
        deleteSuccess: "מקצוע נמחק בהצלחה",
        deleteError: "שגיאה במחיקת המקצוע. אנא נסה שוב מאוחר יותר",
        invalid: "חסרים פרמטרים",
        updateSuccess: "מקצוע עודכן בהצלחה",
        updateError: "שגיאה בעדכון המקצוע. אנא נסה שוב מאוחר יותר",
    },
    classes: {
        success: "רשימת כיתות נשלפה בהצלחה",
        error: "שגיאה בשליפת רשימת הכיתות. אנא נסה שוב מאוחר יותר",
        createSuccess: "כיתה נוספה בהצלחה",
        createError: "שגיאה בהוספת כיתה. אנא נסה שוב מאוחר יותר",
        deleteSuccess: "כיתה נמחקה בהצלחה",
        deleteError: "שגיאה במחיקת כיתה. אנא נסה שוב מאוחר יותר",
        invalid: "חסרים פרמטרים",
        updateSuccess: "כיתה עודכנה בהצלחה",
        updateError: "שגיאה בעדכון כיתה. אנא נסה שוב מאוחר יותר",
    },
    annualSchedule: {
        success: "מערכת שנתית נשלפה בהצלחה",
        error: "שגיאה בשליפת המערכת השנתית. אנא נסה שוב מאוחר יותר",
        createSuccess: "השעה נוספה למערכת השנתית בהצלחה",
        createError: "שגיאה בהוספת שעה למערכת השנתית. אנא נסה שוב מאוחר יותר",
        updateSuccess: "השעה עודכנה במערכת השנתית בהצלחה",
        updateError: "שגיאה בעדכון שעה במערכת השנתית. אנא נסה שוב מאוחר יותר",
    },
    dailySchedule: {
        success: "מערכת יומית נשלפה בהצלחה",
        error: "שגיאה בשליפת המערכת היומית. אנא נסה שוב מאוחר יותר",
        createSuccess: "שעה נוספה למערכת היומית בהצלחה",
        createError: "שגיאה בהוספת שעה למערכת היומית. אנא נסה שוב מאוחר יותר",
        updateSuccess: "השעה עודכנה במערכת היומית בהצלחה",
        updateError: "שגיאה בעדכון שעה במערכת היומית. אנא נסה שוב מאוחר יותר",
        deleteSuccess: "עמודה נמחקה מהמערכת היומית בהצלחה",
        deleteError: "שגיאה במחיקת עמודה מהמערכת היומית. אנא נסה שוב מאוחר יותר",
        noScheduleFound: "מערכת יומית נשלפה בהצלחה - אין למורה נתונים מיום זה",
    },
    publish: {
        success: "היום פורסם בהצלחה",
        error: "שגיאה בפרסום היום",
        alreadyPublished: "היום כבר פורסם",
    }
}

export default messages;
