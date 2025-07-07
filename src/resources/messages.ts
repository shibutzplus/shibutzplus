const messages = {
    auth: {
        serverError: "שגיאה",
        unauthorized: "אין הרשאה. אנא התחבר כדי לגשת למידע זה",
        paramRequired: "פרמטר נדרש",
        login: {
            failed: "כניסה נכשלה",
            invalid: "חסרים פרמטרים",
            success: "Signed in successfully"
        },
        register: {
            failed: "הרשמה נכשלה",
            emailInUse: "האימייל כבר בשימוש",
            invalid: "חסרים פרמטרים",
            success: "Registered successfully",
            schoolExist: "בית הספר כבר קיים",
            schoolNotFound: "בית ספר לא נמצא"
        }
    },
    connect: {
        error: "שגיאה"
    },
    addTeacher: {
        error: "שגיאה",
        success: "Teacher added successfully",
        invalid: "חסרים פרמטרים",
        exist: "המורה כבר קיים",
    },
    school: {
        notFound: "בית ספר לא נמצא",
        retrieveSuccess: "מידע בית ספר נשלף בהצלחה",
        retrieveError: "שגיאה בשליפת מידע בית ספר. אנא נסה שוב מאוחר יותר",
        idRequired: "מזהה בית ספר נדרש"
    },
    teachers: {
        retrieveSuccess: "רשימת מורים נשלפה בהצלחה",
        retrieveError: "שגיאה בשליפת רשימת המורים. אנא נסה שוב מאוחר יותר",
        createSuccess: "מורה נוסף בהצלחה",
        createError: "שגיאה בהוספת מורה. אנא נסה שוב מאוחר יותר",
        deleteSuccess: "מורה נמחק בהצלחה",
        deleteError: "שגיאה במחיקת מורה. אנא נסה שוב מאוחר יותר",
        alreadyExists: "מורה עם שם זה כבר קיים",
        invalid: "חסרים פרמטרים",
        updateSuccess: "מורה עודכן בהצלחה",
        updateError: "שגיאה בעדכון מורה. אנא נסה שוב מאוחר יותר",
    },
    subjects: {
        retrieveSuccess: "רשימת מקצועות נשלפה בהצלחה",
        retrieveError: "שגיאה בשליפת רשימת המקצועות. אנא נסה שוב מאוחר יותר",
        createSuccess: "מקצוע נוסף בהצלחה",
        createError: "שגיאה בהוספת מקצוע. אנא נסה שוב מאוחר יותר",
        deleteSuccess: "מקצוע נמחק בהצלחה",
        deleteError: "שגיאה במחיקת מקצוע. אנא נסה שוב מאוחר יותר",
        alreadyExists: "מקצוע עם שם זה כבר קיים",
        invalid: "חסרים פרמטרים",
        updateSuccess: "מקצוע עודכן בהצלחה",
        updateError: "שגיאה בעדכון מקצוע. אנא נסה שוב מאוחר יותר",
    },
    classes: {
        retrieveSuccess: "רשימת כיתות נשלפה בהצלחה",
        retrieveError: "שגיאה בשליפת רשימת הכיתות. אנא נסה שוב מאוחר יותר",
        createSuccess: "כיתה נוספה בהצלחה",
        createError: "שגיאה בהוספת כיתה. אנא נסה שוב מאוחר יותר",
        deleteSuccess: "כיתה נמחקה בהצלחה",
        deleteError: "שגיאה במחיקת כיתה. אנא נסה שוב מאוחר יותר",
        alreadyExists: "כיתה עם שם זה כבר קיימת",
        invalid: "חסרים פרמטרים",
        updateSuccess: "כיתה עודכנה בהצלחה",
        updateError: "שגיאה בעדכון כיתה. אנא נסה שוב מאוחר יותר",
    },
    annualSchedule: {
        retrieveSuccess: "מערכת שנתית נשלפה בהצלחה",
        retrieveError: "שגיאה בשליפת המערכת השנתית. אנא נסה שוב מאוחר יותר",
        createSuccess: "השעה נוספה למערכת השנתית בהצלחה",
        createError: "שגיאה בהוספת שיעור למערכת השנתית. אנא נסה שוב מאוחר יותר",
        updateSuccess: "השעה עודכנה במערכת השנתית בהצלחה",
        updateError: "שגיאה בעדכון שיעור במערכת השנתית. אנא נסה שוב מאוחר יותר",
        alreadyExists: "שיעור כבר קיים במערכת השנתית בשעה זו",
        ANNUAL_SCHEDULE_UPDATED_SUCCESSFULLY: "מערכת שנתית עודכנה בהצלחה",
        ANNUAL_SCHEDULE_CREATED_SUCCESSFULLY: "מערכת שנתית נוצרה בהצלחה",
        FAILED_TO_CREATE_ANNUAL_SCHEDULE: "שגיאה ביצירת מערכת שנתית",
        FAILED_TO_UPDATE_ANNUAL_SCHEDULE: "שגיאה בעדכון מערכת שנתית",
        DAILY_SCHEDULE_UPDATED_SUCCESSFULLY: "מערכת יומית עודכנה בהצלחה",
        DAILY_SCHEDULE_CREATED_SUCCESSFULLY: "מערכת יומית נוצרה בהצלחה",
        FAILED_TO_CREATE_DAILY_SCHEDULE: "שגיאה ביצירת מערכת יומית",
        FAILED_TO_UPDATE_DAILY_SCHEDULE: "שגיאה בעדכון מערכת יומית",
    },
    dailySchedule: {
        retrieveSuccess: "מערכת יומית נשלפה בהצלחה",
        retrieveError: "שגיאה בשליפת המערכת היומית. אנא נסה שוב מאוחר יותר",
        createSuccess: "שיעור נוסף למערכת היומית בהצלחה",
        createError: "שגיאה בהוספת שיעור למערכת היומית. אנא נסה שוב מאוחר יותר",
        updateSuccess: "שיעור עודכן במערכת היומית בהצלחה",
        updateError: "שגיאה בעדכון שיעור במערכת היומית. אנא נסה שוב מאוחר יותר",
        alreadyExists: "שיעור כבר קיים במערכת היומית בשעה זו",
        noScheduleFound: "מערכת יומית נשלפה בהצלחה - אין למורה נתונים מיום זה",
    },
    common: {
        invalid: "חסרים פרמטרים",
        invalidParameters: "חסרים פרמטרים או פרמטרים שגויים",
        serverError: "שגיאת שרת פנימית. אנא נסה שוב מאוחר יותר"
    }
}

export default messages;
