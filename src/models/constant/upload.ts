export const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB

export const UPLOAD_ERROR_MESSAGES = {
    FILE_TOO_LARGE: "ניתן לצרף קבצים עד 20MB. מגבלה זו נועדה להבטיח הורדה מהירה למורה הצופה בחומר.",
    UPLOAD_FAILED: "בעיה בהעלאת הקובץ, אנא נסו שוב",
    HISTORY_FILES_NOT_SAVED: "קבצים מצורפים אינם נשמרים בהיסטוריה.",
} as const;
