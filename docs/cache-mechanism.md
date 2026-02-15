# Caching Mechanism

## Overview
Shibutz Plus uses a multi-layered caching strategy to ensure high performance for public-facing pages while maintaining data consistency through precise invalidation.

## Architecture

### 1. Data Caching (`unstable_cache`)
We use Next.js `unstable_cache` to cache the results of expensive database queries.
- **Location:** Wrapper functions in `src/services/` (e.g., `getCachedDailySchedule`, `getCachedTeachersList`).
- **TTL (Time To Live):** Default is set to **24 hours (86400 seconds)**. 
- **TTL for classes and subjects:** Default is set to **7 days (604800 seconds)**. 
This acts as a fallback if manual invalidation fails.
- **Serialization Handling:** Note that `unstable_cache` serializes data to JSON. Our service wrappers automatically reconstruct `Date` objects from strings after fetching from cache.

### 2. Cache Tags (`src/lib/cacheTags.ts`)
To avoid inconsistent cache states, we use a centralized tagging system. Tags are scoped to specific entities or schools:
- `schoolSchedule(schoolId)`: All schedule data for a school.
- `teachersList(schoolId)`: The list of teachers.
- `teacher(teacherId)`: Specific teacher profile.
- `classesList(schoolId)` / `subjectsList(schoolId)`: Entity lists.

### 3. On-Demand Invalidation (`revalidateTag`)
When data is modified via a **Server Action**, the system immediately invalidates the relevant tags.
- **Flow:** `Action` -> `DB Update` -> `revalidateTag(tag)`.
- This ensures that the very next request from any user will fetch fresh data from the database.

### 4. Router Revalidation (`revalidatePath`)
For critical public pages (like the published daily schedule), we use `revalidatePath` to ensure the static page cache is also refreshed.

### 5. Client-Side Polling (Sync Service)
The application uses a polling mechanism (`usePollingUpdates`) to keep client data in sync with the server.
- **Interval:** Check for updates every 40 seconds.
- **Immediate Check:** Polling is triggered **immediately** on component mount and when the tab becomes visible. This ensures that users returning to the tab or navigating between screens always get the latest data without waiting for the next interval tick.
- **History preservation:** The client tracks the last sync timestamp across navigation. This ensures that updates missed while the user was on a different screen (e.g., History) are fetched immediately upon returning to a live screen (e.g., Daily Schedule).

### 6. Server-Side Relation Fetching
To guarantee data consistency, especially for the **Manager Public Portal** and **Teacher Portal**:
- **Daily Schedule Service:** The `getCachedDailySchedule` function fetches full entity relations (Teacher, Subject, SubTeacher) from the database, rather than just returning IDs.
- **Benefit:** This ensures that even if the client's local list of entities (e.g., teacher names) is stale, the schedule itself will always display the correct, up-to-date names directly from the server response. This decoupling makes the public view robust against client-side cache delays.

## Summary Table

| Data Type | Cache Method | Invalidation Trigger | Sync Strategy |
| :--- | :--- | :--- | :--- |
| Daily Schedule | `unstable_cache` | `publishDailyScheduleAction` | Polling (Teacher/Event cols) |
| Teacher List | `unstable_cache` | `add/update/deleteTeacherAction` | Polling (Entities) + Server Relations |
| Personalized Schedule | `unstable_cache` | Any schedule modification | Polling (Teacher col) |
| School Settings | `unstable_cache` | `updateSettingsAction` | Re-fetch |

## FAQ (שאלות ותשובות)

### מתי ניקוי הקאש מתבצע?
בכל פעם שמבוצע שינוי במידע במערכת (דרך Server Action), המערכת מנקה באופן אוטומטי את הקאש הרלוונטי. 

לדוגמה:
- **עדכון לו"ז:** שינוי של תא בודד בלו"ז היומי מנקה את הקאש של כל המערכת הבית-ספרית לאותו יום, כולל הפורטל האישי של כל המורים.
- **עדכון מורה/כיתה/מקצוע:** הוספה או עריכה של ישות מנקה גם את רשימת הישויות וגם את קאש הלו"ז הבית-ספרי. בנוסף, הלו"ז היומי נשלף מהשרת עם פרטי המורה המעודכנים (ולא מסתמך רק על המזהה), כך שהשם החדש מופיע מיד.

### למה הקאש של הלו"ז היומי והלו"ז של המורה מתנקים יחד?
שניהם משתמשים באותו "תג" (`schoolSchedule`). זה מבטיח סנכרון מלא – ברגע שהנהלת בית הספר פרסמה שינוי, המורה יראה אותו מיד בפורטל האישי שלו ללא שום עיכוב.

### איך הפורטל הציבורי מתעדכן?
הפורטל הציבורי (Manager Public Portal) משתמש באותו מנגנון של `getCachedDailySchedule`. בזכות שליפת המידע המלא מהשרת (ולא רק IDs), כל שינוי בשם מורה/מקצוע משתקף בו מיד עם רענון או שינוי תאריך, ללא תלות בקאש מקומי של הדפדפן.

---

## Best Practices
- **Always use `cacheTags`:** Never hardcode tag strings; use the helper in `src/lib/cacheTags.ts`.
- **Granular Invalidation:** Revalidate ONLY what changed (e.g., revalidate a specific teacher, not the whole school, unless necessary).
- **Service Wrappers:** Keep the caching logic inside the service files, not in the UI components or Server Actions.
- **Sync Timestamps:** Do not reset sync timestamps on navigation; allow the client to catch up on missed events.
