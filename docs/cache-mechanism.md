# Caching Mechanism

## Overview
Shibutz Plus uses a multi-layered caching strategy to ensure high performance for public-facing pages while maintaining data consistency through precise invalidation.

## Architecture

### 1. Data Caching (`unstable_cache`)
We use Next.js `unstable_cache` to cache the results of expensive database queries.
- **Location:** Wrapper functions in `src/services/` (e.g., `getCachedDailySchedule`, `getCachedTeachersList`).
- **TTL (Time To Live):** Default is set to **2 hours (7200 seconds)**. This acts as a fallback if manual invalidation fails.
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

## Summary Table

| Data Type | Cache Method | Invalidation Trigger |
| :--- | :--- | :--- |
| Daily Schedule | `unstable_cache` | `publishDailyScheduleAction` |
| Teacher List | `unstable_cache` | `add/update/deleteTeacherAction` |
| Personalized Schedule | `unstable_cache` | Any schedule modification |
| School Settings | `unstable_cache` | `updateSettingsAction` |

## Best Practices
- **Always use `cacheTags`:** Never hardcode tag strings; use the helper in `src/lib/cacheTags.ts`.
- **Granular Invalidation:** Revalidate ONLY what changed (e.g., revalidate a specific teacher, not the whole school, unless necessary).
- **Service Wrappers:** Keep the caching logic inside the service files, not in the UI components or Server Actions.
