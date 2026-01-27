/**
 * Sync Service
 * Handles push/poll for updates from the sync API
 */
import { DAILY_TEACHER_COL_DATA_CHANGED, DAILY_SCHEDULE_DATA_CHANGED, DAILY_PUBLISH_DATA_CHANGED, MATERIAL_CHANGED } from "@/models/constant/sync";
import { SyncChannel } from "@/models/types/sync";

export type { SyncChannel };

export interface SyncPollResponse {
  latestTs: number;
  count: number;
  items: Array<{
    channel: SyncChannel;
    ts: number;
  }>;
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
      console.error("Sync poll failed with status:", res.status);
      return null;
    }

    const data: SyncPollResponse = await res.json();
    return data;
  } catch (error) {
    console.error("Error polling sync updates:", error);
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
): Promise<{ hasUpdates: boolean; latestTs: number; channels: SyncChannel[] }> => {
  const data = await pollUpdates(params);

  if (!data) {
    return { hasUpdates: false, latestTs: params.since, channels: [] };
  }

  const hasUpdates = data.latestTs > params.since;
  const newItems = data.items.filter(item => item.ts > params.since);
  const channels = Array.from(new Set(newItems.map(item => item.channel)));

  return {
    hasUpdates,
    latestTs: data.latestTs,
    channels
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
    return [DAILY_TEACHER_COL_DATA_CHANGED, DAILY_PUBLISH_DATA_CHANGED, MATERIAL_CHANGED];
  }
  return [DAILY_TEACHER_COL_DATA_CHANGED, DAILY_SCHEDULE_DATA_CHANGED, DAILY_PUBLISH_DATA_CHANGED];
};

/**
 * Pushes a sync notification to the server
 * @param type - The type of sync event to push
 * @returns Promise that resolves when the push is complete
 */
export const pushSyncUpdate = async (type: SyncChannel): Promise<number | null> => {
  try {
    // Skip push when running in development
    //if (process.env.NODE_ENV === "development") {
    //  return; // For debug comment out this block
    //}

    let url = `/api/sync/push?type=${type}`;

    // If running on dev server, prepend base URL
    if (typeof window === "undefined") {
      const baseUrl =
        process.env.NEXT_PUBLIC_APP_URL ||
        (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

      url = `${baseUrl}${url}`;
    }

    const res = await fetch(url, { method: "POST", keepalive: true });
    if (res.ok) {
      const data = await res.json();
      return data.ts;
    }
  } catch (error) {
    console.error("Error pushing sync update:", error);
  }
  return null;
};
