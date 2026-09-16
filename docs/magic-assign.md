# מנגנון שיבוץ אוטומטי חכם למילוי מקום (Magic Assign ✨)

מסמך זה מסביר בשפה פשוטה וברורה כיצד פועל מנגנון ה"שיבוץ האוטומטי" (כפתור מטה הקסמים ✨), מה היו השיקולים שהנחו את בנייתו מתוך נתוני האמת של בתי הספר, וכיצד הוא מקבל החלטות לפי שיטת המדרגות (Tiers).  
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
3. **העדפת חלונות פנויים על פני ביטול פעילויות לימוד:**  
   הכי משתלם ופשוט לשבץ מורה שנמצא כבר בבית הספר ויש לו שעת חלון פנויה. רק אם אין חלון פנוי, פונים למורים בקבוצות עבודה/לימוד (כדי לצמצם ביטול קבוצות).
4. **הרגלים היסטוריים:**  
   בכל בית ספר יש שגרה והרגלים: יש מורים מסוימים שנוהגים להחליף מורה מסוים בשעה מסוימת, או ממלאי מקום קבועים שפונים אליהם תמיד קודם.
5. **שעות מאוחרות לפי שכבת גיל (נקודת השבר):**  
   - **כיתות בוגרות (ד' ומעלה):** בשעה 6 אחוזי מילוי המקום צונחים בחצי ושחרור מפורש הביתה מזנק. בכיתות אלו עדיף לשחרר אלא אם יש מורה נוסף בשיעור (Co-teacher).
   - **כיתות צעירות (א' עד ג'):** מנהלים שומרים על מסגרת קפדנית (מחויבות להורים ולצהרונים) – עדיפות ראשונה לשיבוץ מורה מחליף, ושחרור מתבצע רק כמוצא אחרון אם אין שום מורה פנוי.
6. **אי-שיבוץ מחנכים כממלאי מקום (הגנה משחיקה):**  
   מנהלים נמנעים כמעט לחלוטין מלהכניס מחנך כממלא מקום בכיתת האם שלו כשיש מורה מקצועי חסר. שעות החלון של המחנך מיועדות לשעות שהייה, פרטני, קשר עם הורים ומנוחה משחיקה.

---

## 3. איך האלגוריתם "חושב"? (שיטת הדירוג והמדרגות)

האלגוריתם פועל בשלושה שלבים ברורים וקבועים:

### שלב 1: מי בכלל יכול להחליף? (קווים אדומים - סינון מוחלט)
לפני הכל, נפסלים מועמדים שלא יכולים ללמד:
* **מורים שלא התחילו את היום / סיימו / ביום חופשי:** לעולם לא מקפיצים מורה קבוע מהבית לפני תחילת יום עבודתו, אחרי סיומו או ביום חופשי.
* **מורה שמלמד כיתה רגילה (פרונטלית) באותה שעה:** פסילה מוחלטת (לא מפרקים שיעור פרונטלי רגיל).
* **מורה שכבר משובץ להחלפה באותה שעה** או הודיע שהוא חסר היום.
* **סייעות ומשלבות:** נפסלות אוטומטית ממילוי מקום כהוראה.
* **תקרה יומית של 3 שעות החלפה למורה קבוע:** מורה מן המניין מוגבל לעד 3 שעות מילוי מקום ביום (הגנה משחיקה). פטור מתקרה זו חל רק על מורה נוסף בשיעור או המשכיות שיעור כפול.
* **הגנה מוחלטת על הנהלה וייעוץ:** מורה שמשובץ בשעה הנוכחית לשעת ניהול, סגנות, ייעוץ, טיפול או הדרכה — חסום לחלוטין מלהילקח למילוי מקום.

---

### שלב 2: מדרגות עדיפות (Tiers) — מי מנצח?
במקום חישוב נקודות מסובך שעלול ליצור עיוותים, האלגוריתם מחלק את המועמדים למדרגות ברורות. **מדרגה נמוכה יותר תמיד מנצחת מדרגה גבוהה יותר:**

| מדרגה (Tier) | קבוצת המורים | הסבר ושיקול פדגוגי |
| :---: | :--- | :--- |
| **0** | **המשכיות שיעור כפול / מורה נוסף/ת באותו שיעור** | מורה שכבר נמצא בשיעור הנוכחי כמורה נוסף (הוראה בצוות), או שממשיך שיעור כפול באותה כיתה ברצף. |
| **1** | **מורה קבוע/ה בחלון פנוי** | מורה שכבר נוכח בביה"ס ויש לו שעת חלון במערכת – הפתרון הקל והמשתלם ביותר. |
| **2** | **מורה בקבוצת עבודה/לימוד** | מורה שמלמד כעת קבוצה לא-פרונטלית (תגבור/שילוב/פרטני שאינו מוגן). עדיף פחות מחלון פנוי כדי לא לבטל פעילות. |
| **3** | **מורה מחליפ/ה נוכח/ת בביה"ס** | ממלא/ת מקום שנוכח/ת פיזית בבית הספר (הוצב/ה בעמודה כחולה או מלמד/ת היום). |
| **4** | **מורה מחליפ/ה מהבית (קריאה)** | ממלא/ת מקום מהמאגר בבית — **מגויס/ת אך ורק להיעדרות של יום שלם (4+ שעות)**. |
| **5** | **צוות הנהלה וייעוץ** | סגניות, מנהלות, יועצות ופסיכולוגים — מוגנים ומשמשים כמוצא אחרון מוחלט. |

---

### שלב 3: שוברי שוויון (בתוך אותה מדרגה בלבד)
אם יש מספר מועמדים באותה מדרגה בדיוק (למשל שני מורים בחלון פנוי), ההכרעה מתבצעת לפי שיקולים אלו:
* **+3 נקודות:** מכיר/ה את הכיתה (מלמד/ת אותה במערכת השנתית).
* **+2 נקודות:** המלצת עבר מובהקת (החליף/ה מורה זה באותה שעה 4+ פעמים בעבר).
* **+1 נקודה:** המלצת עבר קלה (1–3 פעמים).
* **+1 נקודה:** רצף שעות סמוכות באותה עמודה.
* **-1 נקודה:** לכל שעת החלפה שהמורה כבר ביצע/ה היום (איזון עומסים הוגן בין המורים).
* **-3 נקודות:** מחנך/ת של כיתת היעד (הגנה מפני שחיקה בכיתת האם בשעות חלון).

---

## 4. שקיפות מלאה בנימוק השיבוץ
לכל שיבוץ שהמערכת מבצעת מצורף נימוק ברור שמסביר בדיוק מדוע המורה נבחר.  
כאשר מורה משובץ ברצף שיעור כפול, הנימוקים משולבים ומופרדים בפסיק כדי לשמור על קריאות ובהירות:
* **"מורה בקבוצת עבודה/לימוד, המשכיות שיעור"** (או עם "ומכיר/ה את הכיתה")
* **"חלון פנוי במערכת, המשכיות שיעור"** (או "מכיר/ה את הכיתה — חלון פנוי במערכת, המשכיות שיעור")
* **"מורה נוסף/ת באותו שיעור, המשכיות שיעור"**
* **"מורה מחליפ/ה נוכח/ת בביה"ס, המשכיות שיעור"**

---

## 5. איפה פוגשים את זה בממשק?
1. **כפתור "שיבוץ אוטומטי" בסרגל העליון (מטה קסמים ✨):**  
   מופיע בסרגל הפעולות (ובמובייל בסרגל לצד בחירת היום). לחיצה עליו עוברת על כל המורים החסרים וממלאת את כל השעות הפתוחות בהצעה מושלמת.
   אם נוסף מורה חסר חדש – לחיצה על הכפתור תשבץ אך ורק את השעות הפתוחות החדשות מבלי לשנות או לדרוס שיבוצים קיימים.
2. **שמירה ישירה ומיידית:**  
   השיבוץ מוצג מיד בלוח ונשמר ישירות ל-PostgreSQL בשרת, כך שבריענון או כניסה ממכשיר אחר הכל שמור ומסונכרן בזמן אמת.

---
---

# Part B: Technical Architecture & Implementation (English)

### 1. Architectural Philosophy: Zero-DB In-Memory Execution
Instead of executing repetitive and slow SQL queries on every user interaction, the algorithm executes **100% in-memory** in sub-10 milliseconds.

The engine operates on client-side state cached via [DailyTableContext.tsx](file:///c:/Dev/shibutzplus/src/context/DailyTableContext.tsx):
* `teachers`: The full roster of teachers with assigned roles.
* `classes`: Class list including flags for activities and grade level extraction.
* `mapAvailableTeachers`: Structured availability map from annual schedule (`[day][hour] -> teacherId[]`).
* `teacherClassMap`: Schedule lookup mapping `[day][hour][teacherId] -> classId`.
* `systemRecommendations`: Historical substitution patterns (`[hour][originalTeacherName] -> candidateNames[]`).
* `mainDailyTable`: The current date's schedule matrix.

---

### 2. Implementation Modules

#### A. Core Algorithm Engine: [src/utils/autoSubstitution.ts](file:///c:/Dev/shibutzplus/src/utils/autoSubstitution.ts)
Exposes the pure function:
```typescript
export function autoAssignSubstitutes(options: AutoAssignOptions): AutoAssignResult
```

**Execution Pipeline:**
1. **Target Selection:** Processes all missing teacher columns (`columnType === 0`) or a specific `targetColumnId`.
2. **Chronological Traversal:** Evaluates hours sequentially ($h = 1 \dots 10$) per missing column to support double-period continuity.
3. **Hard Exclusions:**
   - Universal workday bounds (`bounds.min` to `bounds.max`): Regular teachers cannot be called before arrival, after departure, or on free days.
   - Frontal lesson protection: A teacher currently leading a regular class is never pulled out.
   - Protected activity shielding: Management, counseling, therapy, and specialized activities are strictly non-interruptible.
   - Daily quota: Regular teachers with annual schedule cannot exceed `MAX_DAILY_SUB_HOURS = 3` (exempt for co-teachers and double-period continuations).
   - Staff, aides, and assistants (`/משלב|סייע/i`) are excluded.
4. **Tier Assignment (Categorical Priority):**
   - `TIER_CONTINUATION` (0): Continuing a double period in the same column, or scheduled co-teacher in this exact lesson.
   - `TIER_FREE_WINDOW` (1): Regular on-campus teacher with a free period this hour.
   - `TIER_ACTIVITY_GROUP` (2): Regular on-campus teacher in a non-frontal activity/group.
   - `TIER_SUB_ON_CAMPUS` (3): Dedicated substitute present on campus (blue column or scheduled).
   - `TIER_SUB_CALL_IN` (4): Dedicated substitute called from home (restricted to full-day absences).
   - `TIER_PROTECTED_STAFF` (5): Management and counseling staff (absolute last resort).
5. **Tie-Breaker Scoring within Tier:**
   - Encoded as `score = (5 - tier) * 100 + tieBreaker`
   - +3: Class familiarity (teaches target class in annual schedule).
   - +2 / +1: Historical recommendation frequency.
   - +1: Adjacent substitution continuity in the same column.
   - -1 per assigned substitution hour today (workload balancing).
   - -3: Homeroom teacher of target class (burnout protection).
6. **Reason String Generation:**
   - Dynamically identifies base status (`חלון פנוי במערכת`, `מורה בקבוצת עבודה/לימוד`, `מורה נוסף/ת באותו שיעור`, `מורה מחליפ/ה נוכח/ת בביה"ס`).
   - If continuing a double period, combines the base reason with `, המשכיות שיעור`.
7. **Late Hour Handling ($h \ge 6$):**
   - Lower grades (Grades 1–3): Finds an on-campus substitute first; dismisses only if no one is available.
   - Upper grades (Grades 4+): Automatically dismisses ("משוחררים") unless a co-teacher is present in the room.

---

#### B. Batch Server Action: [src/app/actions/PUT/updateDailyTeacherCellsBatchAction.ts](file:///c:/Dev/shibutzplus/src/app/actions/PUT/updateDailyTeacherCellsBatchAction.ts)
- Persists all newly assigned cells in a single batch query to PostgreSQL.
- Invalidates Next.js cache tags (`schoolSchedule`, `dailySchedule`) and emits a sync event across connected clients.

---

#### C. Context Integration: [src/context/DailyTableContext.tsx](file:///c:/Dev/shibutzplus/src/context/DailyTableContext.tsx)
- Exposes `autoAssignSchedule: (columnId?: string) => Promise<void> | void`.
- Performs optimistic update on the local schedule matrix and triggers batch persistence.
