# מנגנון שיבוץ אוטומטי חכם למילוי מקום (Magic Assign ✨)

מסמך זה מסביר בשפה פשוטה וברורה כיצד פועל מנגנון ה"שיבוץ האוטומטי" (כפתור מטה הקסמים ✨), מה היו השיקולים שהנחו את בנייתו מתוך נתוני האמת של בתי הספר, וכיצד הוא מקבל החלטות.  
בסוף המסמך מצורף תיעוד טכני באנגלית עבור מפתחים.

---

# חלק א': הסבר כללי וידידותי (בעברית)

## 1. המטרה: למה צריך את זה?
בכל בוקר, מנהלים ורכזי מערכת מתמודדים עם מורים שמודיעים על היעדרות. עליהם למצוא פתרון מהיר לכל שעה: מי יחליף את המורה? האם המורה שמחליף פנוי? האם הוא מכיר את התלמידים?  
מטרת הפיצ'ר היא לאפשר בלחיצת כפתור אחת לקבל **הצעת שיבוץ הגיונית, חכמה וטבעית**, בדיוק כמו שרכז מערכת מנוסה היה חושב, ובכך לחסוך זמן יקר של התלבטויות בכל בוקר מחדש.

---

## 2. מה גילינו כשחקרנו את ההיסטוריה של בתי הספר?
לפני שבנינו את האלגוריתם, בדקנו עשרות אלפי החלפות אמיתיות שבוצעו בבתי ספר לאורך השנה. גילינו כמה עובדות מרתקות על האופן שבו מנהלים משבצים בפועל:

1. **ניהול כיתה ומשמעת קודמים למקצוע:**  
   ברוב המקרים, מנהל מעדיף לשבץ מורה **שכבר מכיר את הכיתה** (למשל מורה שמלמד אותם מקצוע אחר), מאשר מורה שמלמד את אותו מקצוע אבל התלמידים לא מכירים אותו. היכרות עם התלמידים מונעת בעיות משמעת.
2. **שמירה על רצף (לא לבלבל את התלמידים):**  
   כשמורה חסר לכמה שעות רצופות באותו יום, במעל 65% מהמקרים המנהלים העדיפו שאותו ממלא מקום ימשיך עם הכיתה ברצף, במקום להחליף מורה בכל 45 דקות.
3. **הרגלים היסטוריים:**  
   בכל בית ספר יש שגרה והרגלים: יש מורים מסוימים שנוהגים להחליף מורה מסוים בשעה מסוימת, או ממלאי מקום קבועים שפונים אליהם תמיד קודם.
4. **שעות מאוחרות לפי שכבת גיל (נקודת השבר):**  
   - **כיתות בוגרות (ה' ומעלה):** בשעה 6 אחוזי מילוי המקום צונחים בחצי (מ-85% ל-44%), ושחרור מפורש הביתה מזנק פי 12 (מ-0.8% ל-28.2%).  
   - **כיתות צעירות (א' עד ד'):** מנהלים שומרים על מסגרת קפדנית (מחויבות להורים ולצהרונים) – בשעה 6 יש כ-80% כיסוי ופחות מ-2% שחרור. שחרור מתבצע רק בשעה 7 ומעלה.
5. **אי-שיבוץ מחנכים כממלאי מקום (הגנה משחיקה):**  
   אף שמחנך הכיתה מלמד את רוב השעות השבועיות (18–24 שעות), מנהלים **נמנעים כמעט לחלוטין (0.25% בלבד)** מלהכניס אותו כממלא מקום בכיתה שלו כשיש מורה מקצועי חסר. שעות החלון של המחנך מיועדות לשעות שהייה, פרטני, קשר עם הורים ומנוחה משחיקה.

---

## 3. איך האלגוריתם "חושב"? (סרגל הנקודות)

האלגוריתם פועל בשני שלבים פשוטים:

### שלב 1: מי בכלל יכול להחליף? (תנאי סף - קווים אדומים)
לפני הכל, נפסלים מועמדים שלא יכולים ללמד:
* **מורים שלא התחילו את היום / סיימו / ביום חופשי (איסור מוחלט להקפצה מהבית):** לעולם לא מביאים מורה מן המניין לפני תחילת יום עבודתו (`hour < bounds.min`), אחרי סיום יום עבודתו (`hour > bounds.max`) או ביום חופשי. מורה שטרם הגיע לבית הספר נמצא בביתו ולא ייקרא במיוחד.
* **סינון גורמים חיצוניים ותל"ן (מבני, ללא רשימות שמות):** מורים בסטטוס רגיל הפעילים יום אחד בלבד בשבוע ועם 6 שעות שבועיות ומטה (תל"ן, חוגים, חווה וכו') מסוננים אוטומטית ממילוי מקום.
* **ממלאי מקום נוכחים מול ממלאי מקום בבית:** ממלא מקום שסומן כנוכח בבית הספר (עמודה כחולה) מתועדף ראשון. לעומת זאת, ממלא מקום מהמאגר שיושב בבית מקבל קנס (`UNCONFIRMED_SUB_CALL_PENALTY: 40`) ונמצא בעדיפות נמוכה יותר ממורה שכבר נמצא פיזית בבית הספר (בחלון או בפרטני).
* **תקרה קשיחה של 2 שעות למורה מן המניין (הגנה משחיקה):** מורה רגיל (שאינו ממלא מקום רשמי או בעמודה כחולה) **נחסם משיבוץ לאחר שצבר 2 שעות מילוי מקום באותו יום** (אלא אם כן הוא מורה נוסף באותו שיעור). הדבר תואם לממצא שב-83.5% מהמקרים ב-DB מורים רגילים לא עושים מעל שעתיים ביום.
* **תיעדוף עמודות לפי שכבת גיל (א'-ג' קודמות ל-ה'-ו'):** כשמספר מורים חסרים בו-זמנית, האלגוריתם מטפל קודם כל בעמודות שמלמדות כיתות צעירות בשעות הבוקר.
* **הגנה על שיעור כפול באותה כיתה (מניעת פיצול):** אם לכיתה יש שיעור כפול באותו מקצוע, מורה שפנוי לשתי השעות ברצף מקבל בונוס מיוחד (`DOUBLE_PERIOD_SAME_CLASS_BONUS: 35`), ומורה שתפוס בשעה השנייה נפסל/נקנס (`BLOCKED_NEXT_HOUR_PENALTY: 45`) כדי למנוע החלפת מורה באמצע שיעור כפול.
* **מורה שמלמד כיתה רגילה אחרת באותה שעה (פסילה מוחלטת):** לעולם לא מוציאים מורה מכיתה רגילה שבה הוא מלמד כדי למלא מקום בכיתה אחרת.
* מורה שכבר שובץ להחלפה בכיתה אחרת באותה שעה בלוח היומי.
* מורה שהודיע בעצמו שהוא חסר היום.
* **סייעות ומשלבות:** מועמדים ששמם כולל "משלבת" או "סייעת" נפסלים מיידית משיבוץ אוטומטי כעובדי הוראה בכיתה.
* אנשי צוות והנהלה שאינם מיועדים למילוי מקום (`role === 'staff'`).
* **הגנה מוחלטת על שעות ניהול, סגנות, ייעוץ, פסיכולוגיה, טיפול והדרכה (קו אדום):**  
  מורה שמשובץ בשעה הנוכחית לשעת **ניהול, סגנות, הנהלה, ייעוץ/יעוץ, פסיכולוגיה, טיפול, שיח רגשי או הדרכה** — **חסום לחלוטין מלהילקח למילוי מקום באותה שעה!** שעות אלו מיועדות לניהול תקין של ביה"ס ולבריאות הנפש של התלמידים, ולעולם לא יבוטלו לטובת מילוי מקום שגרתי.
* **זיהוי מבני של סגניות ומנהלות (שעות ניהול בעיקר):**  
  מורים שעיקר שעותיהם או לפחות 4 שעות במערכת השנתית הן שעות ניהול/סגנות — מזוהים אוטומטית כאנשי ניהול ומקבלים הגנה מפני מילוי מקום שגרתי (`MANAGEMENT_STAFF_PENALTY: 50`).
* **זיהוי מבני של יועצות וצוות טיפולי (שעות ייעוץ בעיקר):**  
  יועצות חינוכיות, פסיכולוגים ואנשי טיפול (עם 4+ שעות ייעוץ שנתיות) מזוהים אוטומטית ומוגנים ממילוי מקום שגרתי (`COUNSELING_STAFF_PENALTY: 40`). כמו כן, מבוטל לגביהם בונוס "היכרות עם הכיתה" הנובע משעה שבועית בודדת של כישורי חיים/מעגלי הקשבה.
* **העדפת ממלא מקום ייעודי בהיעדרות יום מלא (4+ שעות):**  
  ביום שבו מורה חסר לכל היום (4 שעות ומעלה), גיוס ממלא מקום רשמי מהמאגר מקבל בונוס משמעותי (`FULL_DAY_SUB_CALL_BONUS: 45`) כדי למלא את הבלוק ולמנוע פירוק של מערכת השעות הפנימית.
* **העברת מורים מקבוצות לימוד פעילות (רוחב, תגבור, שילוב):**  
  העברת מורה מפעילות פדגוגית פעילה כרוכה בקנס מוגדל (`ACTIVITY_GROUP_PENALTY: 20`), כך שהיא משמשת כחלופה משנית בלבד לאחר ניצול חלונות, שעות פרטני/שהייה, או ממלאי מקום ייעודיים.
* **שעות שאינן דורשות החלפה:** האלגוריתם מדלג מראש על שעות של **קבוצות לימוד / פעילויות** (כגון שעות פרטני, שהייה, שעות תפקיד, סלים וכד') שאין בהן צורך בממלא מקום.

### שלב 2: תחרות הנקודות (מי המועמד המוביל?)
מבין כל המורים הפנויים, האלגוריתם מחשב ציון לכל מורה לפי הקריטריונים הבאים:

| מה המורה מביא איתו? | כמה נקודות הוא מקבל? | למה זה חשוב? |
| :--- | :---: | :--- |
| **מורה נוסף בשיעור (Co-teacher)** | **+45 נקודות** | המורה ממילא משובץ לאותה כיתה בדיוק באותה שעה (הוראה בצוות/שילוב) – נשאר לבד בכיתה באפס הפרעה. |
| **המלצת עבר מובהקת (4+ פעמים)** | **+40 נקודות** | נוהג קבוע ומוכח בהיסטוריית ביה"ס להחלפת מורה זה באותו יום ושעה. |
| **ממלא מקום מהמאגר בבית ליום מלא (4+ שעות)** | **+45 נקודות** | גיוס ממלא מקום ייעודי ליום מלא היא הדרך הטבעית והמקובלת לכיסוי יום היעדרות מלא. |
| **המשכיות רצף באותה כיתה (שיעור כפול)** | **+50 נקודות** | אם המורה החליף שעה קודמת/באה באותה כיתה – עדיפות מכרעת למניעת החלפת מורה באמצע שיעור כפול. |
| **פנוי/ה לשעתיים רצופות באותה כיתה (שיעור כפול)** | **+35 נקודות** | בונוס למורה שמסוגל לכסות שיעור כפול במלואו ברצף. |
| **היכרות עם הכיתה (מורה מקצועי)** | **+30 נקודות** | מורה שמלמד את הכיתה הזו במערכת הרגילה ומכיר את התלמידים (לא חל על מחנך, יועצת או סגנית). |
| **המלצת עבר בינונית (2-3 פעמים)** | **+25 נקודות** | היסטוריה של החלפות חוזרות באותו יום ושעה. |
| **נוכח/ת היום (עמודה כחולה)** | **+25 נקודות** | מורה שההנהלה הציבה הבוקר בעמודה ייעודית בלוח כמורה שנמצא/ת בבית הספר וזמין/ה למילוי מקום. |
| **מורה פנוי/ה (חלון במערכת)** | **+25 נקודות** | המורה ממילא מלמד בבית הספר ביום זה ויש לו שעת חלון פנויה. |
| **המשכיות רצף באותה עמודה (בלוק שעתיים)** | **+28 נקודות** | המורה החליף שעה סמוכה באותה עמודה. |
| **צמצום מורים מופרעים (איחוד שעות)** | **+20 נקודות** | מורה שכבר שובץ לשעה אחת היום מקבל עדיפות לשעה שנייה (עד 2 שעות) כדי לא לטרטר מורה נוסף. |
| **ממלא/ת מקום נוכח/ת בביה"ס** | **+20 נקודות** | מורה שהוגדר כממלא מקום ונמצא פיזית בבית הספר היום. |
| **נמצא בבית הספר היום** | **+15 נקודות** | נוכח בבית הספר ביום זה. |
| **המלצת עבר מזדמנת (פעם 1)** | **+10 נקודות** | החלפה בודדת בעבר (בונוס קל, לא גובר על שיקולי רצף ועומס). |
| **עייפות רצף (3+ שיעורים פרונטליים קודמים)** | **מינוס 15 נקודות** | מורה שלימד 3 שיעורים ומעלה ברצף מקבל עדיפות נמוכה יותר בשעה הבאה למניעת עומס יתר. |
| **העברת מורה מפעילות פדגוגית (רוחב/שילוב)** | **מינוס 20 נקודות** | קנס מוגדל להוצאת מורה מקבוצת לימוד פעילה – משמשת רק בהיעדר מורים פנויים. |
| **הגנה על שעות מחנך הכיתה (שחיקה)** | **מינוס 20 נקודות** | הגנה מבנית על חלונות של מחנך הכיתה מלהפוך לממלא מקום בכיתתו. |
| **יועצות חינוכיות / צוות טיפולי** | **מינוס 40 נקודות** | מניעת שחיקה ושיבוץ שגרתי של יועצות ופסיכולוגים למילוי מקום. |
| **סגניות ומנהלות (שעות ניהול)** | **מינוס 50 נקודות** | שמירה על סגניות ואנשי ניהול בתפקידי הניהול והמשמעת של בית הספר. |
| **ממלא מקום מהמאגר בבית לשעה בודדת** | **מינוס 40 נקודות** | הזעקת מורה מהבית עבור שעה בודדת נמנעת כמעט לחלוטין (עדיפות למורים שכבר בביה"ס). |
| **קטיעת שיעור כפול בשעה העוקבת (קנס)** | **מינוס 80 נקודות** | מורה שתפוס בשעה הבאה ויקטע שיעור כפול באותה כיתה נפסל כשיש מורה אחר שיכול לעשות את שתיהן. |

* **כלל שעות מאוחרות ושחרור הביתה (שעה 6 ומעלה):**
  - **כיתות א' עד ג' (שכבה צעירה):** **עדיפות ראשונה למציאת מורה מחליף!** התלמידים הצעירים נשארים ללמוד עם מורה מחליף, ורק אם אין שום מורה פנוי בבית הספר — מתבצע שחרור מוקדם.
  - **כיתות ד' ומעלה (שכבה בוגרת):** עדיפות לשחרור ("משוחררים"), אלא אם כן קיים מורה נוסף בשיעור (Co-teacher).
* **אי-דריסת נתונים קיימים:** המערכת לעולם לא דורסת שיבוץ קיים – שעות שכבר שובץ להן מורה או אירוע נשארות כפי שהן.
* **הסרת כפילויות בתפריט:** הוסרה קטגוריית "המלצת המערכת" מתפריט הבחירה בטבלה כדי למנוע כפילות ובלבול מול הצעות ה-Magic.

---

## 4. איפה פוגשים את זה בממשק?
1. **כפתור "שיבוץ אוטומטי" בסרגל העליון (מטה קסמים ✨):**  
   מופיע כאייקון עדין ואלגנטי בסרגל הפעולות (ובמובייל בסרגל לצד בחירת היום). לחיצה עליו עוברת על כל המורים החסרים וממלאת את כל השעות הפתוחות בהצעה מושלמת.
   אם המשתמש הוסיף מורה חסר חדש במהלך היום – לחיצה על הכפתור תשבץ אך ורק את השעות הפתוחות החדשות מבלי לשנות או לדרוס אף שיבוץ שכבר בוצע.
2. **שמירה ישירה ומיידית:**  
   השיבוץ מוצג מיד בלוח ונשמר ישירות למסד הנתונים (DB), כך שבריענון או כניסה ממכשיר אחר הכל שמור. כמובן שניתן לשנות ידנית כל שעה בכל עת.

---
---

# Part B: Technical Architecture & Implementation (English)

### 1. Architectural Philosophy: Zero-DB In-Memory Execution
Instead of executing complex SQL aggregations on every user click (which would degrade performance and increase database load), the algorithm executes **100% in-memory** in sub-10 milliseconds.

The system relies on client-side state already cached by [DailyTableContext.tsx](file:///c:/Dev/shibutzplus/src/context/DailyTableContext.tsx):
* `teachers`: The full roster of school teachers.
* `classes`: The school classes list (used to detect activities and grade level).
* `mapAvailableTeachers`: Structured map of teacher availability derived from the annual schedule (`[day][hour] -> teacherId[]`).
* `teacherClassMap`: Quick lookup for which class a teacher teaches on a specific day/hour (`[day][hour][teacherId] -> classId`).
* `systemRecommendations`: Pre-aggregated historical patterns fetched once per day switch via `getSystemRecommendationsAction` (`[hour][originalTeacherName] -> candidateNames[]`).
* `mainDailyTable`: The current date's schedule matrix.

---

### 2. Implementation Modules

#### A. Core Algorithm Engine: [src/utils/autoSubstitution.ts](file:///c:/Dev/shibutzplus/src/utils/autoSubstitution.ts)
Exposes the pure function:
```typescript
export function autoAssignSubstitutes(options: AutoAssignOptions): AutoAssignResult
```
**Workflow:**
1. **Target Selection:** Identifies whether to process all missing teacher columns (`columnType === 0`) or a specific `targetColumnId`.
2. **Chronological Traversal:** Iterates hour-by-hour ($h = 1 \dots 10$) per missing teacher column. Chronological traversal guarantees that earlier assigned hours influence subsequent hours for **block continuity**.
3. **Candidate Filtering (Hard Constraints):**
   - Candidate must not be outside active workday bounds (`teacherStartEndMap`): Cannot be before first lesson (`h < min`), after last lesson (`h > max`), or on a free day (`isFreeDay`).
   - Regular teachers (`role === 'regular'` and not in a blue column) are capped at a maximum of 2 substitution hours per day (`MAX_DAILY_SUB_HOURS_REGULAR = 2`), unless they are an existing co-teacher inside the room. Dedicated substitutes remain uncapped.
   - Candidate must not be teaching an active regular class elsewhere at hour $h$ (leaving 30 students unattended).
   - Candidate must not be special education integration aides / assistants (`/משלב|סייע/i`).
   - Candidate must not be `TeacherRoleValues.STAFF`.
   - Candidate must not be absent on the current day (`missingTeacherIds`).
   - Candidate must not be assigned as a substitute or occupied with a lesson/event in another column at hour $h$.
4. **Candidate Scoring (Soft Constraints):**
   - `HISTORICAL_RECOMMENDATION` (+40): Candidate appears in `systemRecommendations[hour][originalTeacherName]`.
   - `BLOCK_CONTINUITY_SAME_CLASS` (+35): Candidate is already assigned to hour $h-1$ or $h+1$ for the **same class**.
   - `CLASS_FAMILIARITY` (+30): Candidate teaches this specific class in the annual schedule.
   - `EXISTING_PRESENT_TEACHER` (+25): Candidate is placed in an existing present teacher column (blue column) today.
   - `ON_CAMPUS_WORKING_DAY` (+15): Candidate has at least one lesson elsewhere on this day.
   - `BLOCK_CONTINUITY_DIFF_CLASS` (+10): Candidate is assigned adjacent hour in the column, but with a different class.
   - `DAILY_LOAD_PENALTY` (-10 per assigned hour): Balances workload among active teachers.
5. **Conflict Protection:** Existing assignments or custom cell events are strictly preserved (`if (cell.subTeacher?.id || cell.event) continue;`).
6. **Late Hour Handling ($h \ge 6$):**
   - For lower grades (up to Grade 3 / א'-ג'): The engine first searches for an on-campus substitute teacher. Dismissal ("משוחררים") is only used as a fallback if no available substitute is found on campus.
   - For upper grades (Grade 4 and above / ד' ומעלה): The engine prioritizes dismissal (`cell.event = "משוחררים"`), unless an existing co-teacher is already scheduled inside this exact lesson room (`isCoTeacherInLesson`).

---

#### B. Batch Persistence: [src/app/actions/PUT/updateDailyTeacherCellsBatchAction.ts](file:///c:/Dev/shibutzplus/src/app/actions/PUT/updateDailyTeacherCellsBatchAction.ts)
- Single batch server action updating all newly assigned substitution cells in PostgreSQL via `Promise.all`.
- Avoids repetitive roundtrips, invalidates relevant Next.js cache tags (`schoolSchedule`, `dailySchedule`), and broadcasts a single WebSocket sync event (`DAILY_TEACHER_COL_DATA_CHANGED`).

---

#### C. Context Integration: [src/context/DailyTableContext.tsx](file:///c:/Dev/shibutzplus/src/context/DailyTableContext.tsx)
- Exposes `autoAssignSchedule: (columnId?: string) => Promise<void> | void`.
- Pulls date boundaries (`settings.fromHour` to `settings.toHour`).
- Invokes `autoAssignSubstitutes`, applies optimistic UI state update to `mainDailyTable`, queues newly assigned cells with a `DBid`, and persists them in batch via `updateDailyTeacherCellsBatchAction`.
- Displays concise feedback toasts (`autoAssignSuccess`, `autoAssignPartial`, `autoAssignNoSlots`).

---

#### D. UI Components
1. **[DailyActionBtns.tsx](file:///c:/Dev/shibutzplus/src/components/actions/DailyActionBtns/DailyActionBtns.tsx) & [.module.css](file:///c:/Dev/shibutzplus/src/components/actions/DailyActionBtns/DailyActionBtns.module.css):**
   - Renders a minimalist, borderless magic wand icon button (`.autoAssignIconBtn`) with a subtle hover scaling effect.
   - On mobile (<=660px), rendered directly in the header bar next to the date dropdown.
   - Triggers smart auto-assignment for all unfilled missing slots.
2. **[MngrDailyBldTeacherCell.tsx](file:///c:/Dev/shibutzplus/src/components/tables/mngrDailyBld/MngrDailyBldTeacherCell/MngrDailyBldTeacherCell.tsx):**
   - Added `useEffect` to instantly synchronize the cell's select dropdown with newly assigned substitutes or dismissal events.
