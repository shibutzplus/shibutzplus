import { redis } from "@/lib/redis";
import {
    DAILY_TEACHER_COL_DATA_CHANGED,
    DAILY_EVENT_COL_DATA_CHANGED,
    ENTITIES_DATA_CHANGED,
    DAILY_PUBLISH_DATA_CHANGED,
    MATERIAL_CHANGED,
    ADMIN_BROADCAST_MESSAGE
} from "@/models/constant/sync";
import { SyncChannel, SyncPayload } from "@/models/types/sync";
import { dbLog } from "@/services/loggerService";

/**
 * Pushes a sync notification to the Redis queue (Server-side only)
 * @param type - The type of sync event to push
 * @param payload - Optional metadata (schoolId, date, targetSchoolId, targetUserId, message, senderName)
 * @returns Promise that resolves with the timestamp, or null if failed/invalid
 */
export const pushSyncUpdateServer = async (type: SyncChannel, payload?: SyncPayload): Promise<number | null> => {
    try {
        let channel: string;
        if (type === DAILY_TEACHER_COL_DATA_CHANGED) channel = DAILY_TEACHER_COL_DATA_CHANGED;
        else if (type === DAILY_EVENT_COL_DATA_CHANGED) channel = DAILY_EVENT_COL_DATA_CHANGED;
        else if (type === ENTITIES_DATA_CHANGED) channel = ENTITIES_DATA_CHANGED;
        else if (type === DAILY_PUBLISH_DATA_CHANGED) channel = DAILY_PUBLISH_DATA_CHANGED;
        else if (type === MATERIAL_CHANGED) channel = MATERIAL_CHANGED;
        else if (type === ADMIN_BROADCAST_MESSAGE) channel = ADMIN_BROADCAST_MESSAGE;
        else {
            dbLog({ description: `serverSyncService: invalid type ${type}`, schoolId: payload?.schoolId });
            return null;
        }

        const item = {
            id: `daily-${Date.now()}`,
            channel,
            ts: Date.now(),
            payload: {
                schoolId: payload?.schoolId,
                date: payload?.date,
                targetSchoolId: payload?.targetSchoolId,
                targetUserId: payload?.targetUserId,
                targetAudience: payload?.targetAudience,
                message: payload?.message,
                senderName: payload?.senderName,
            },
        };

        await redis.lpush("sync_items", JSON.stringify(item));
        return item.ts;

    } catch (err) {
        dbLog({
            description: `serverSyncService/push failed: ${err instanceof Error ? err.message : String(err)}`,
            schoolId: payload?.schoolId
        });
        return null;
    }
};
