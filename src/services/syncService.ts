/**
 * Sync Service
 * Handles push/poll for updates from the sync API
 */

export type SyncChannel = "teacher" | "event" | "material" | "detailsUpdate";

export interface SyncPollResponse {
  latestTs: number;
  count: number;
  items: Array<{
    channel: string;
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
    // Skip polling when running in development (dont forget to do it also for push updates)
    if (process.env.NODE_ENV === "development") {
      return null; // For debug comment out this block  
    }

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
): Promise<{ hasUpdates: boolean; latestTs: number }> => {
  const data = await pollUpdates(params);

  if (!data) {
    return { hasUpdates: false, latestTs: params.since };
  }

  const hasUpdates = data.latestTs > params.since;

  return {
    hasUpdates,
    latestTs: data.latestTs,
  };
};

/**
 * Gets the appropriate channels based on the current pathname
 * @param pathname - Current pathname from Next.js router
 * @param teacherPortalPath - The teacher portal path to check against
 * @returns Array of channels to listen to
 */
export const getChannelsForPath = (
  pathname: string,
  teacherPortalPath: string
): SyncChannel[] => {
  // On teacher screen, listen to teacher columns events only
  // On schedule screen, listen to both teacher and events columns changes
  if (pathname.includes(teacherPortalPath)) {
    return ["teacher"];
  }
  return ["teacher", "event"];
};

/**
 * Pushes a sync notification to the server
 * @param type - The type of sync event to push
 * @returns Promise that resolves when the push is complete
 */
export const pushSyncUpdate = async (type: SyncChannel): Promise<void> => {
  try {
    // Skip push when running in development (dont forget to do it also for polling updates)
    if (process.env.NODE_ENV === "development") {
      return; // For debug comment out this block
    }
    void fetch(`/api/sync/push?type=${type}`, { method: "POST", keepalive: true });
  } catch (error) {
    console.error("Error pushing sync update:", error);
  }
};
