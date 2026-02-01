/**
 * Sync Service
 * Handles poll (client side) for updates from the sync API
 * Push is handled only by the server (serverSyncService)
 */
import { DAILY_TEACHER_COL_DATA_CHANGED, DAILY_EVENT_COL_DATA_CHANGED, DAILY_PUBLISH_DATA_CHANGED, MATERIAL_CHANGED, ENTITIES_DATA_CHANGED } from "@/models/constant/sync";
import { SyncChannel, SyncPayload, SyncItem } from "@/models/types/sync";
import { logErrorAction } from "@/app/actions/POST/logErrorAction";

export type { SyncChannel, SyncPayload, SyncItem };

export interface SyncPollResponse {
  latestTs: number;
  count: number;
  items: SyncItem[];
}

export interface PollUpdatesParams {
  since: number;
  channels: SyncChannel[];
}

/**
 * Polls the sync API for updates
 * @param params - Parameters for polling (since timestamp and channels to listen to)
 * @returns Promise with the poll response data
 */
const pollUpdates = async (params: PollUpdatesParams): Promise<SyncPollResponse | null> => {
  try {
    // Skip polling when running in development
    //if (process.env.NODE_ENV === "development") {
    //  return null; // For debug comment out this block  
    //}

    const { since, channels } = params;
    const channelsParam = channels.join(",");
    const url = `/api/sync/poll?since=${since}&channels=${encodeURIComponent(channelsParam)}`;

    const res = await fetch(url, { cache: "no-store" });

    if (!res.ok) {
      logErrorAction({ description: `Sync poll failed with status: ${res.status}` });
      return null;
    }

    const data: SyncPollResponse = await res.json();
    return data;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (message === "Failed to fetch" || message === "Load failed") return null;
    logErrorAction({ description: `Error polling sync updates: ${message}` });
    return null;
  }
};

/**
 * Checks if there are new updates available
 * @param params - Parameters for polling
 * @returns Promise with boolean indicating if updates are available and the latest timestamp
 */
export const checkForUpdates = async (
  params: PollUpdatesParams
): Promise<{ hasUpdates: boolean; latestTs: number; items: SyncItem[] }> => {
  const data = await pollUpdates(params);

  if (!data) {
    return { hasUpdates: false, latestTs: params.since, items: [] };
  }

  const hasUpdates = data.latestTs > params.since;
  const newItems = data.items.filter(item => item.ts > params.since);

  return {
    hasUpdates,
    latestTs: data.latestTs,
    items: newItems
  };
};

/**
 * Gets the appropriate channels based on the current pathname
 * @param pathname - Current pathname from Next.js router
 * @param teacherMaterialPortalPath - The teacher portal path to check against
 * @returns Array of channels to listen to
 */
export const getChannelsForPath = (
  pathname: string,
  teacherMaterialPortalPath: string
): SyncChannel[] => {
  if (pathname.includes(teacherMaterialPortalPath)) {
    return [DAILY_TEACHER_COL_DATA_CHANGED, DAILY_PUBLISH_DATA_CHANGED, MATERIAL_CHANGED, ENTITIES_DATA_CHANGED];
  }
  return [DAILY_TEACHER_COL_DATA_CHANGED, DAILY_EVENT_COL_DATA_CHANGED, DAILY_PUBLISH_DATA_CHANGED, ENTITIES_DATA_CHANGED];
};


