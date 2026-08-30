import {
    DAILY_TEACHER_COL_DATA_CHANGED,
    DAILY_EVENT_COL_DATA_CHANGED,
    ENTITIES_DATA_CHANGED,
    DAILY_PUBLISH_DATA_CHANGED,
    MATERIAL_CHANGED,
    ADMIN_BROADCAST_MESSAGE
} from "../constant/sync";

export type SyncChannel =
    | typeof DAILY_TEACHER_COL_DATA_CHANGED
    | typeof DAILY_EVENT_COL_DATA_CHANGED
    | typeof ENTITIES_DATA_CHANGED
    | typeof DAILY_PUBLISH_DATA_CHANGED
    | typeof MATERIAL_CHANGED
    | typeof ADMIN_BROADCAST_MESSAGE;

export interface SyncPayload {
    schoolId?: string;
    date?: string; // YYYY-MM-DD
    targetSchoolId?: string;
    targetUserId?: string;
    targetAudience?: "all" | "teachers" | "managers";
    message?: string;
    senderName?: string;
}

export interface SyncItem {
    channel: SyncChannel;
    ts: number;
    payload?: SyncPayload;
}

