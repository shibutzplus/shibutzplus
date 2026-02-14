# Sync Service (Upstash Redis)

## Overview
The Sync Service is a real-time (polling-based) update mechanism that ensures the client-side UI reflects changes made by other users or background processes without requiring a full page refresh.

## Architecture
The system uses **Upstash Redis** as a lightweight message broker to track changes.

### 1. Server-Side: Signaling Changes (`src/services/sync/serverSyncService.ts`)
Whenever a relevant change occurs in the database (e.g., a substitution is added, a schedule is published), the backend calls `pushSyncUpdateServer`.
- **Storage:** It pushes a JSON object into a Redis list named `sync_items`.
- **Payload:** Includes a `channel` (event type), `ts` (timestamp), and `payload` (metadata like `schoolId` and `date`).
- **Channels:** Defined in `src/models/constant/sync.ts` (e.g., `DAILY_PUBLISH_DATA_CHANGED`, `MATERIAL_CHANGED`).

### 2. Client-Side: Polling for Updates (`src/services/sync/clientSyncService.ts`)
The client doesn't listen to a persistent socket (to save resources/costs). Instead, it polls the server at regular intervals.
- **API Endpoint:** `/api/sync/poll` (fetches items from Redis since a specific timestamp).
- **Filtering:** The client only listens to channels relevant to the current page (managed by `getChannelsForPath`).

### 3. React Hook: `usePollingUpdates.ts`
This hook encapsulates the polling logic:
- **Interval:** Polls every `POLL_INTERVAL_MS` (default ~5-10 seconds).
- **Visibility Awareness:** Pauses polling when the browser tab is hidden to save battery and network.
- **Auto-Refresh:** When an update is detected for the active school/date, it triggers a callback (`onRefreshRef`) to re-fetch the necessary data from the database.

## Workflow Example
1. **Change:** A principal publishes the schedule for 2024-05-20.
2. **Push:** The server executes `pushSyncUpdateServer(DAILY_PUBLISH_DATA_CHANGED, { schoolId, date })`.
3. **Poll:** A teacher's browser, polling every 10s, calls `/api/sync/poll?since=1716180000`.
4. **Detect:** The server returns the "Publish" event from Redis.
5. **Update:** The `usePollingUpdates` hook sees the event and triggers a refresh of the teacher's schedule view.

## Performance & Optimization
- **Batching:** Multiple changes are fetched in a single poll request.
- **No-Store:** The poll API uses `cache: "no-store"` to ensure fresh data.
- **Route Filtering:** Polling is disabled on static pages (FAQ, History) to reduce unnecessary load.
