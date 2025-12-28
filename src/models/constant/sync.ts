// TRIGGERED WHEN: Add/Update/Delete of Teacher, substitutes, Class, Subject, Work Group.
// CONSUMER: useInitData -> Runs only once in the startup to check if other session changed the lists.
//                          If yes, forces fresh fetch of all list entities from DB, bypassing the localStorage cache.
export const LISTS_DATA_CHANGED = "lists";

// TRIGGERED WHEN: A teacher column in the DAILY SCHEDULE is updated (assignments, deletions)
// CONSUMER: Teacher Portal & Publish Portal -> Triggers refresh of daily schedule data
export const DAILY_TEACHER_COL_DATA_CHANGED = "teacher";

// TRIGGERED WHEN: An event column OR any column reorder in the DAILY SCHEDULE is updated
// CONSUMER: Publish Portal -> Triggers refresh of daily schedule data
export const DAILY_SCHOOL_DATA_CHANGED = "school";

// TRIGGERED WHEN: A daily schedule is published or unpublished
// CONSUMER: Teacher Portal & Publish Portal -> Triggers refresh of available dates (options)
export const PUBLISH_DATA_CHANGED = "publish";

// TRIGGERED WHEN: "Material" (instructions) text is entered in Manager Daily Page or Teacher Portal
// CONSUMER: Teacher Portal -> Triggers refresh of material text
export const MATERIAL_CHANGED = "material";
