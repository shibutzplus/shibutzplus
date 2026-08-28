# שינויים עתידיים שלא פורסמו למורה (Teacher Changes Unpublished)

מסמך זה מרכז את הארכיטקטורה, הלוגיקה והמימוש של פיצ'ר הצפייה בשינויים עתידיים שטרם פורסמו עבור מורים בפורטל.

---

## 🎯 מטרת הפיצ'ר
- לאפשר למורה לצפות בשינויים עתידיים במערכת האישית שלו (חיסורים, הזזות ומילוי מקום) שהוזנו במערכת אך **טרם פורסמו רשמית** לכלל בית הספר.
- שמירה על הפרדה מלאה: מסך המערכת הרגיל מציג רק ימים שפורסמו, והמסך החדש מציג אך ורק ימים שלא פורסמו.

---

## 🧭 השוואה בין המסכים

| מאפיין | המערכת שלי (`/teacher-changes`) | המערכת שלי - שינויים שלא פורסמו (`/teacher-changes-unpublished`) |
| :--- | :--- | :--- |
| **תאריכים המוצגים** | רק תאריכים שפורסמו רשמית (`publishDates`) | רק תאריכים עתידיים עם שינוי למורה שטרם פורסמו |
| **זיהוי שינויים למורה** | תאריכים מפורסמים בלבד | עמודה אדומה (חיסור), עמודה כחולה (שינויים), מילוי מקום |
| **כפתור מערכת בית ספרית** | מוצג (אם יש שינויים ביום הנבחר) | מוסתר (המערכת הבית ספרית טרם פורסמה) |
| **מבנה המסך** | טבלת שינויים יומית + כותרת + דרופדאון | זהה לחלוטין למסך המערכת שלי |

---

## 🔍 לוגיקת זיהוי ושליפת נתונים (`getTeacherPortalDataAction.ts`)

- **תאריך מינימלי (`minDateStr`)**:
  - מחושב לפי `AUTO_SWITCH_TIME` (ברירת מחדל `16:00`).
  - לפני השעה שנקבעה: החל מהיום.
  - לאחר השעה שנקבעה: החל ממחר.
- **שאילתת שינויים עתידיים**:
  - שולפת תאריכים מטבלת `daily_schedule` שבהם:
    - המורה הוא המורה המקורי (`originalTeacherId = teacherId`) **או** מורה מחליף (`subTeacherId = teacherId`).
    - כל סוגי העמודות: עמודה אדומה (`columnType = 0`) ועמודה כחולה (`columnType = 1`).
    - תאריך גדול או שווה ל-`minDateStr`.
- **חישוב ימים שלא פורסמו**:
  - `unpublishedFutureDates = futureDates.filter(d => !publishDates.includes(d))`
  - הדגל `hasUnpublishedFutureAbsences` מוחזר כ-`true` רק אם קיים לפחות יום אחד כזה.

---

## 📋 תצוגת תפריט ההמבורגר (`HamburgerNav.tsx`)

- **תנאי הצגה**:
  - השורה **"המערכת שלי (שינויים שלא פורסמו)"** מופיעה בתפריט רק אם `hasUnpublishedFutureAbsences === true`.
  - במידה ואין שינויים שלא פורסמו – השורה אינה מופיעה כלל.
- **מצב נוכחי (הכנה לעתיד)**:
  - ב-[HamburgerNav.tsx](file:///c:/Dev/shibutzplus/src/components/navigation/HamburgerNav/HamburgerNav.tsx) מוגדר `const hasUnpublished = false && ...;` כדי להסתיר את הכניסה עד להשקה הרשמית של הפיצ'ר.
  - לפתיחת הפיצ'ר בעתיד: יש להסיר את ה-`false &&` בלבד.

---

## 🎨 עיצוב ודרופדאון תאריכים (`PortalPageLayout.tsx` & `CleanDropdownSelect.tsx`)

- **תאריך יחיד**: מוצג כטקסט נקי בראש הדף (ללא חץ וללא דרופדאון).
- **מספר תאריכים**: מוצג דרופדאון נקי:
  - אפשרות נבחרת מודגשת בבולד בלבד (ללא צבע כחול וללא אייקונים).
  - פורמט שמות: יום ראשון מפורסם בפורמט "שינויים במערכת להיום/למחר", וכל שאר הימים בפורמט `DD/MM/YYYY`.

---

## 🔄 מנגנון סנכרון ורענון (`PortalContext.tsx`)

- **שימור תאריך נבחר (`keepCurrent`)**:
  - בעת קבלת עדכון מנהל בזמן אמת (Sync/Polling), המערכת שומרת על התאריך שבו המורה צופה כעת ולא קופצת חזרה להיום.
- **טעינה מסונכרנת**:
  - בעת רענון במסך השינויים שלא פורסמו, `handleRefreshDates({ includeFutureAbsences: true })` מרענן את רשימת הימים שלא פורסמו ברקע בצורה חלקה.

---

## 📁 קבצים מרכזיים בפרויקט

1. **נתיבים והגדרות**:
   - `src/routes/index.ts` – הגדרת הנתיב `teacherChangesUnpublished: "/teacher-changes-unpublished"`.
   - `src/resources/navigation.tsx` – הגדרת פריט התפריט.
2. **צד שרת / Actions**:
   - `src/app/actions/GET/getTeacherPortalDataAction.ts` – שליפת נתוני מורה וזיהוי ימים שלא פורסמו.
3. **דפים ו-Layout**:
   - `src/app/(public)/teacher-changes-unpublished/[schoolId]/[teacherId]/page.tsx` – דף הצפייה הייעודי.
   - `src/app/(public)/teacher-changes-unpublished/layout.tsx` – עטיפה ב-`PortalPageLayout`.
   - `src/components/layout/pageLayouts/PortalPageLayout/PortalPageLayout.tsx` – ניהול כותרת, דרופדאון והסתרת כפתור מערכת בית ספרית.
4. **תפריט וקונטקסט**:
   - `src/components/navigation/HamburgerNav/HamburgerNav.tsx` – הצגה מותנית בתפריט.
   - `src/context/PortalContext.tsx` – ניהול State, שמירת תאריך נוכחי וסנכרון נתונים.
