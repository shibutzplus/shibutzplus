// TRIGGERED WHEN: Add/Update/Delete of Entity: Teacher, substitutes, Class, Subject, Work Group.
// CONSUMER: useInitData -> Runs only once in the startup to check if other session changed the lists.
//                          If yes, forces fresh fetch of all list entities from DB, bypassing the localStorage cache.
export const ENTITIES_DATA_CHANGED = "entities";

// TRIGGERED WHEN: Only if a teacher column in the DAILY SCHEDULE is updated (assignments, deletions)
// CONSUMER: Teacher Portal: Material page & School schedule pages
export const DAILY_TEACHER_COL_DATA_CHANGED = "teacherCol";

// TRIGGERED WHEN: An event column update OR any column reorder in the DAILY SCHEDULE
// CONSUMER: Teacher Portal: School schedule page & also Daily Schedule page
export const DAILY_SCHEDULE_DATA_CHANGED = "daily";

// TRIGGERED WHEN: A daily schedule is published or unpublished
// CONSUMER: Teacher Portal & Publish Portal -> Triggers refresh of available dates (options)
export const DAILY_PUBLISH_DATA_CHANGED = "publish";

// TRIGGERED WHEN: "Material" (instructions) text is entered in Manager Daily Page or Teacher Portal
// CONSUMER: Teacher Portal -> Triggers refresh of material text
export const MATERIAL_CHANGED = "material";

// Polling configuration
export const POLL_INTERVAL_MS = 30000; // 30 seconds
