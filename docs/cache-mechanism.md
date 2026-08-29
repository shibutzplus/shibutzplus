# Caching Mechanism

## Overview
Shibutz Plus uses a multi-layered caching strategy to ensure high performance for public-facing pages while maintaining data consistency through precise invalidation.

## Architecture

### 1. Data Caching (`unstable_cache` + In-Memory Map)
We use Next.js `unstable_cache` to cache the results of expensive database queries.
- **Location:** Wrapper functions in `src/services/` (e.g., `getCachedDailySchedule`, `getCachedTeachersList`).
- **Pattern:** Each service file maintains a `Map<string, Function>` that stores the wrapped `unstable_cache` function per cache key. This avoids recreating the wrapper on every call while keeping the actual caching inside Next.js's cache layer.
- **TTL (Time To Live):**
  - **Daily Schedule, History:** 24 hours (86400 seconds).
  - **Teachers, Classes, Subjects, Annual Schedule, Annual Alt Schedule:** 7 days (604800 seconds).
  - **School Settings:** 1 hour (3600 seconds).
  - TTLs act as a fallback only — all invalidation is done explicitly via `revalidateTag`.
- **Serialization Note:** `unstable_cache` serializes data to JSON internally. Date fields arrive from cache as strings. Callers should handle date reconstruction where needed (e.g., `new Date(record.date)` in history mapping).

### 2. Cache Tags (`src/lib/cacheTags.ts`)
To avoid inconsistent cache states, we use a centralized tagging system. Tags are scoped to specific entities or schools:
- `dailySchedule(schoolId, date)`: Daily schedule for a specific school and date.
- `dailyScheduleSchool(schoolId)`: All daily schedules across all dates for a school.
- `schoolSchedule(schoolId)`: All teacher/personalized schedules for a school. Also used for Annual Schedule.
- `teachersList(schoolId)`: The list of teachers.
- `teacher(teacherId)`: Specific teacher profile.
- `classesList(schoolId)` / `subjectsList(schoolId)`: Entity lists.
- `history(schoolId)` / `historyByDate(schoolId, date)`: History records.
- `school(schoolId)`: School settings and metadata.
- `annualAltSchedule(schoolId)`: The annual alternative (emergency) schedule.

### 3. On-Demand Invalidation (`revalidateTag`)
When data is modified via a **Server Action**, the system immediately invalidates the relevant tags.
- **Flow:** `Action` -> `DB Update` -> `revalidateTag(tag)` -> `pushSyncUpdateServer`.
- This ensures that the very next request from any user will fetch fresh data from the database.
- **Important:** `clearAnnualScheduleCache(schoolId)` clears the in-memory Map **and** calls `revalidateTag(cacheTags.schoolSchedule(schoolId))` internally. It is fully self-contained — no separate `revalidateTag` is needed in the calling Action.

### 4. Router Revalidation (`revalidatePath`)
For critical public pages (like the published daily schedule), we use `revalidatePath` to ensure the static page cache is also refreshed.

### 5. Client-Side Polling (Sync Service)
The application uses a polling mechanism (`usePollingUpdates`) to keep client data in sync with the server.
- **Interval:** Check for updates every 40 seconds.
- **Immediate Check:** Polling is triggered **immediately** on component mount and when the tab becomes visible. This ensures that users returning to the tab or navigating between screens always get the latest data without waiting for the next interval tick.
- **History preservation:** The client tracks the last sync timestamp across navigation. This ensures that updates missed while the user was on a different screen (e.g., History) are fetched immediately upon returning to a live screen (e.g., Daily Build).

### 6. Server-Side Relation Fetching
To guarantee data consistency, especially for the **Manager Public Portal** and **Teacher Portal**:
- **Daily Schedule Service:** The `getCachedDailySchedule` function fetches full entity relations (Teacher, Subject, SubTeacher) from the database, rather than just returning IDs.
- **Benefit:** This ensures that even if the client's local list of entities (e.g., teacher names) is stale, the schedule itself will always display the correct, up-to-date names directly from the server response. This decoupling makes the public view robust against client-side cache delays.

## Summary Table

| Data Type | TTL | Cache Method | Invalidation Trigger | Sync Strategy |
| :--- | :--- | :--- | :--- | :--- |
| Daily Schedule | 24h | `unstable_cache` | Any schedule modification action | Polling (Teacher/Event cols) |
| Teacher List | 7d | `unstable_cache` | `add/update/deleteTeacherAction` | Polling (Entities) + Server Relations |
| Class List | 7d | `unstable_cache` | `add/update/deleteClassAction` | Polling (Entities) |
| Subject List | 7d | `unstable_cache` | `add/update/deleteSubjectAction` | Polling (Entities) |
| Annual Schedule | 7d | `unstable_cache` | `add/update/deleteAnnual*Action`, entity deletion | Client state reset (`setAnnualScheduleTable(undefined)`) |
| Alternative Schedule | 7d | `unstable_cache` | `addAnnualAltAction`, `deleteAnnualAltByDayClassAction` | Polling (Teacher col) |
| History | 7d | `unstable_cache` | Daily cron (`updateHistory`) | Re-fetch on date change |
| Personalized Teacher Schedule | 24h | `unstable_cache` | Any schedule modification | Polling (Teacher col) |
| School Settings | 1h | `unstable_cache` | `updateSettingsAction` | Direct response (no client re-fetch triggered) |

> **Note on Development vs Production:** In development mode (`NODE_ENV === "development"`), services bypass `unstable_cache` and fetch directly from the DB. In production, caching is fully active with automatic invalidation via `revalidateTag`.

## FAQ (שאלות ותשובות)

### מתי ניקוי הקאש מתבצע?
בכל פעם שמבוצע שינוי במידע במערכת (דרך Server Action), המערכת מנקה באופן אוטומטי את הקאש הרלוונטי. 

לדוגמה:
- **עדכון לו"ז:** שינוי של תא בודד בלו"ז הבנייה (Daily Build) מנקה את הקאש של כל המערכת הבית-ספרית לאותו יום, כולל הפורטל האישי של כל המורים.
- **עדכון מורה/כיתה/מקצוע:** הוספה או עריכה של ישות מנקה גם את רשימת הישויות וגם את קאש הלו"ז הבית-ספרי. בנוסף, הלו"ז היומי נשלף מהשרת עם פרטי המורה המעודכנים (ולא מסתמך רק על המזהה), כך שהשם החדש מופיע מיד.

### למה הקאש של הלו"ז היומי והלו"ז של המורה מתנקים יחד?
שניהם משתמשים באותו "תג" (`schoolSchedule`). זה מבטיח סנכרון מלא – ברגע שהנהלת בית הספר פרסמה שינוי, המורה יראה אותו מיד בפורטל האישי שלו ללא שום עיכוב.

### איך הפורטל הציבורי מתעדכן?
הפורטל הציבורי (Manager Public Portal) משתמש באותו מנגנון של `getCachedDailySchedule`. בזכות שליפת המידע המלא מהשרת (ולא רק IDs), כל שינוי בשם מורה/מקצוע משתקף בו מיד עם רענון או שינוי תאריך, ללא תלות בקאש מקומי של הדפדפן.

### מה ההבדל בין `clearAnnualScheduleCache` ל-`revalidateTag`?
`clearAnnualScheduleCache` מוחק את ה-wrapper מה-Map הפנימי בזיכרון **וגם** קורא ל-`revalidateTag(cacheTags.schoolSchedule(schoolId))` בתוכה. הפונקציה **self-contained** – אין צורך לקרוא ל-`revalidateTag` נפרד לאחריה ב-Action.

---

## Best Practices
- **Always use `cacheTags`:** Never hardcode tag strings; use the helper in `src/lib/cacheTags.ts`.
- **Granular Invalidation:** Revalidate ONLY what changed (e.g., revalidate a specific teacher, not the whole school, unless necessary).
- **Service Wrappers:** Keep the caching logic inside the service files, not in the UI components or Server Actions.
- **Sync Timestamps:** Do not reset sync timestamps on navigation; allow the client to catch up on missed events.
- **`clearAnnualScheduleCache` is self-contained:** It clears the in-memory Map and calls `revalidateTag` internally. No additional `revalidateTag(cacheTags.schoolSchedule(schoolId))` is needed in the calling Action.
