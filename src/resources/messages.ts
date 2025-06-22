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
        alreadyExists: "מורה עם שם זה כבר קיים"
    },
    subjects: {
        retrieveSuccess: "רשימת מקצועות נשלפה בהצלחה",
        retrieveError: "שגיאה בשליפת רשימת המקצועות. אנא נסה שוב מאוחר יותר",
        createSuccess: "מקצוע נוסף בהצלחה",
        createError: "שגיאה בהוספת מקצוע. אנא נסה שוב מאוחר יותר",
        alreadyExists: "מקצוע עם שם זה כבר קיים"
    },
    classes: {
        retrieveSuccess: "רשימת כיתות נשלפה בהצלחה",
        retrieveError: "שגיאה בשליפת רשימת הכיתות. אנא נסה שוב מאוחר יותר",
        createSuccess: "כיתה נוספה בהצלחה",
        createError: "שגיאה בהוספת כיתה. אנא נסה שוב מאוחר יותר",
        alreadyExists: "כיתה עם שם זה כבר קיימת"
    }
}

export default messages;
