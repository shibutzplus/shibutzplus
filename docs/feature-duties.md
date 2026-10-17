# מפרט טכני ליישום פיצ'ר: עמודת תורנויות (Duties Column)

מסמך זה מתעד את תוצאות בדיקת ההיתכנות, דרישות המערכת ותוכנית היישום המלאה עבור פיצ'ר "תורנויות" בלוח היומי (`daily-build`).

---

## 1. רקע ומטרת הפיצ'ר
לאפשר למנהל בית הספר להגדיר עמודה יומית מסוג חדש – **"תורנויות"**, שבה ניתן להגדיר עבור כל שעה/תא:
1. **טקסט חופשי** – שם, מיקום או שעת התורנות (לדוגמה: `*7:45-8:00*`, `שער ראשי`, `חצר עליונה`).
2. **בחירה מרובה של מורים** – שיבוץ מספר מורים מן המניין לאותה תורנות באמצעות פופאפ בחירה ייעודי.

העמודה תתנהג בדומה לעמודת אירוע: ניתנת להזזה ימינה/שמאלה, מחיקה, שכפול, עריכת כותרת, והגדרה כעמודה שבועית חוזרת (Recurring).

---

## 2. החלטות מפתח וגבולות גזרה (Scope & Constraints)
1. **השפעה על שיבוצים ומילוי מקום:**
   * מורה המשובץ בתורנות **אינו נחשב תפוס** (`isBusy = false`). הוא עדיין זמין למילוי מקום ויופיע כרגיל ברשימות המורים הפנויים ובאלגוריתם השיבוץ האוטומטי.
2. **חשיפה בלוחות השונים:**
   * **מערכת בית ספרית:** העמודה תוצג בלוח הניהול היומי (`daily-build`) ובלוח השינויים הבית ספרי הכללי (`CommonDailySchoolTable` ו-`CommonDailySchoolFullTable`).
   * **מערכת אישית:** התורנות **אינה** מוצגת בלוח השינויים האישי של המורה (`TeacherDailyChangesTable`).
3. **בסיס הנתונים (DB):**
   * נבחרה **חלופה ב'**: הוספת עמודה ייעודית בסכימה (`teacher_ids text[]`) כדי להבטיח מבנה נקי ושליפות גמישות בעתיד.

---

## 3. ארכיטקטורה ושינויי סכימה (DB Schema & Types)

### א. טבלת `daily_schedule` ב-Drizzle
קובץ: `src/db/schema/daily-schedule.ts` (ובמידת הצורך `src/db/schema/history.ts`)
* הוספת עמודה למערך מזהי מורים:
  ```typescript
  teacherIds: text('teacher_ids').array(),
  ```
* פקודת SQL עבור המיגרציה:
  ```sql
  ALTER TABLE daily_schedule ADD COLUMN IF NOT EXISTS teacher_ids text[];
  ALTER TABLE history ADD COLUMN IF NOT EXISTS teacher_ids text[];
  ```

### ב. טיפוסי נתונים (Types)
קובץ: `src/models/types/dailySchedule.ts`
* הוספת סוג עמודה חדש:
  ```typescript
  export const ColumnTypeValues = {
      missingTeacher: 0,
      existingTeacher: 1,
      event: 2,
      duty: 3,
  } as const;
  export type ColumnType = 0 | 1 | 2 | 3;
  ```
* הוספת `teacherIds` לממשקי `DailyScheduleType` ו-`DailyScheduleCell`:
  ```typescript
  export type DailyScheduleCell = {
      // ... שדות קיימים
      teacherIds?: string[];
  };
  ```

---

## 4. עיצוב ותצוגה בתא (UI / UX)

### א. כפתור הוספת עמודה ב-Toolbar
קובץ: `src/components/actions/DailyActionBtns/DailyActionBtns.tsx`
* הוספת כפתור רביעי: **"תורנויות"** (או בקיצור תורנויות / שיבוץ תורנויות).
* צבע ייעודי (למשל סגול / טורקיז מוגדר ב-`src/style/root.ts`).
* אייקון ייעודי (למשל `Icons.shield` או `Icons.badge` או אייקון מתאים ב-`src/style/icons.tsx`).

### ב. כותרת העמודה (`MngrDailyBldDutyHeader`)
* כותרת התחלתית כברירת מחדל: **"תורנויות"**.
* שדה עריכת כותרת (InputText) בלחיצה / שינוי, בדיוק כמו ב-`MngrDailyBldEventHeader`.
* תפריט עמודה (`MngrDailyBldColMenu`):
  * מחיקה (Delete).
  * הזזה ימינה / שמאלה (Move Right / Left).
  * העתקה והדבקה (Copy / Paste).
  * הפיכה לעמודה שבועית חוזרת ("תורנות שבועית חוזרת").

### ג. מבנה התא (`MngrDailyBldDutyCell`)
* **גובה קבוע של 100px** (`--table-daily-cell-height`): כדי לא לפגוע במבנה הלוח ובשורות השעות.
* **חלק עליון:** שדה קלט לטקסט חופשי (מיקום / שעות תורנות).
* **חלק תחתון עם גלילה אנכית (`overflow-y: auto`):**
  * מציג את רשימת שמות המורים המשובצים (כל מורה בשורה נפרדת או כצ'יפ קומפקטי).
  * כאשר ישנם מספר מורים (למשל 3 ומעלה), מופיע פס גלילה דק המאפשר לראות ולגלול את כל המורים בנוחות.
  * כפתור עריכה / לחיצה על אזור המורים פותח את פופאפ הבחירה המרובה.

### ד. פופאפ בחירה מרובה (`DutyTeacherMultiSelectPopover`)
* מבוסס על סגנון ה-Popover של `MngrDailyBldSubTeacherPopover`:
  1. **תיבת חיפוש מהיר** בראש הפופאפ לסינון שמות מורים.
  2. **רשימת המורים מן המניין** עם תיבת סימון (Checkbox) לצד כל מורה.
  3. **כפתור "אישור"** בתחתית לשמירת הבחירה וסגירת הפופאפ.

---

## 5. לוגיקת צד שרת וסנכרון (Actions & Services)

1. **קריאת הנתונים:**
   * קבצים: `src/services/schedule/getDailySchedule.ts`, `getCachedDailySchedule.ts`.
   * מיפוי שדה `teacherIds` מתוצאות ה-SQL של `dailySchedule` לאובייקט התא.
2. **עדכון / שמירת תא:**
   * שמירת שדה הטקסט (`event` או `instructions`) ושדה המורים (`teacherIds`).
   * שמירת כותרת התורנות ב-`event_title`.
3. **עמודה חוזרת (Recurring):**
   * קובץ: `src/app/actions/POST/makeColumnRecurringAction.ts` ופעולות Update/Delete ל-Recurring.
   * שכפול עמודות תורנות לכל התאריכים השבועיים עד סוף שנת הלימודים, תוך העתקת `teacherIds`, `columnType` והכותרת.
4. **לוח בית ספרי כללי (`CommonDailySchoolTable` / `FullTable`):**
   * רינדור עמודת התורנויות עם הטקסט החופשי ורשימת המורים המשובצים (בדומה לתצוגת אירוע).

---

## 6. צעדי ביצוע מוצעים (Execution Checklist)

- [ ] **שלב 1: סכימה ומיגרציה**
  - עדכון `daily-schedule.ts` (והיסטוריה במידת הצורך).
  - הרצת סקריפט המיגרציה ב-Postgres.
- [ ] **שלב 2: עדכון טיפוסים וסגנונות**
  - הוספת `ColumnTypeValues.duty = 3` ב-`dailySchedule.ts`.
  - הוספת משתנה צבע ואייקון ייעודיים.
- [ ] **שלב 3: הוספת כפתור ב-`DailyActionBtns`**
  - חיבור הפונקציה `addNewEmptyColumn(ColumnTypeValues.duty)`.
- [ ] **שלב 4: רכיבי התא והכותרת**
  - יצירת `MngrDailyBldDutyHeader` (או שילוב עם Event Header).
  - יצירת `MngrDailyBldDutyCell` עם אזור גלילה (Scrollable) לשמות המורים.
  - יצירת `DutyTeacherMultiSelectPopover` לבחירת מורים עם Checkbox וחיפוש.
- [ ] **שלב 5: חיבור ל-Server Actions ו-Recurring**
  - תמיכה ב-Save/Update של מערך `teacherIds`.
  - וידוא עבודה תקינה של שכפול והפיכה לעמודה שבועית חוזרת.
- [ ] **שלב 6: בדיקות ואימות בלוח הציבורי**
  - אימות תצוגה ב-`daily-build` וב-`CommonDailySchoolTable`.
  - בדיקת תקינות התנהגות שאין השפעה על שיבוץ מילוי מקום.
