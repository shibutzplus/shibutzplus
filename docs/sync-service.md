# Sync Service (Upstash Redis)

## Overview
The Sync Service is a real-time (polling-based) update mechanism that ensures the client-side UI reflects changes made by other users or background processes without requiring a full page refresh. It also handles live administrative broadcast messages to active users.

## Architecture
The system uses **Upstash Redis** as a lightweight message broker to track changes.

### 1. Server-Side: Signaling Changes (`src/services/sync/serverSyncService.ts`)
Whenever a relevant change occurs in the database (e.g., a substitution is added, a schedule is published, or an admin sends a broadcast message), the backend calls `pushSyncUpdateServer`.
- **Storage:** It pushes a JSON object into a Redis list named `sync_items`.
- **Payload:** Includes `channel` (event type), `ts` (timestamp), and `payload` metadata (`schoolId`, `date`, `targetSchoolId`, `targetAudience`, `message`, `senderName`).
- **Channels:** Defined in `src/models/constant/sync.ts`:
  - `DAILY_TEACHER_COL_DATA_CHANGED` (`"teacherCol"`)
  - `DAILY_EVENT_COL_DATA_CHANGED` (`"eventCol"`)
  - `ENTITIES_DATA_CHANGED` (`"entities"`)
  - `DAILY_PUBLISH_DATA_CHANGED` (`"publish"`)
  - `MATERIAL_CHANGED` (`"material"`)
  - `ADMIN_BROADCAST_MESSAGE` (`"broadcastMessage"`)

### 2. Client-Side: Polling for Updates (`src/services/sync/clientSyncService.ts`)
The client doesn't listen to a persistent socket (to save resources/costs). Instead, it polls the server at regular intervals.
- **API Endpoint:** `/api/sync/poll` (fetches items from Redis since a specific timestamp).
- **Filtering:** The client listens to channels relevant to the current page (managed by `getChannelsForPath`), and always includes `ADMIN_BROADCAST_MESSAGE`.

### 3. React Hook: `usePollingUpdates.ts`
This hook encapsulates the polling logic across all pages:
- **Interval:** Polls every `POLL_INTERVAL_MS` (60 seconds).
- **Visibility Awareness:** Pauses polling when the browser tab is hidden to save battery and network.
- **Auto-Refresh:** When schedule/entity updates are detected for the active school/date, it triggers a callback (`onRefreshRef`) to re-fetch data.
- **Live Broadcast Messages:** When a `broadcastMessage` arrives:
  - Validates `targetSchoolId` against the active school.
  - Dynamically classifies Manager (private) vs Teacher (public) screens using the `router` configuration to enforce `targetAudience` (`"all"` | `"teachers"` | `"managers"`).
  - Uses `displayedBroadcasts` set to prevent duplicate toasts.
  - Renders a closable `broadcastToast` on matching client screens without triggering unnecessary database data re-fetches.

## Workflow Examples

### Example 1: Schedule Update
1. **Change:** A principal publishes the schedule for 2026-05-20.
2. **Push:** The server executes `pushSyncUpdateServer(DAILY_PUBLISH_DATA_CHANGED, { schoolId, date })`.
3. **Poll:** A teacher's browser calls `/api/sync/poll?since=...`.
4. **Update:** The `usePollingUpdates` hook sees the event and triggers a refresh of the schedule view.

### Example 2: Admin Live Broadcast Message
1. **Send:** Admin opens the Broadcast modal and sends a message targeted to "Managers only" or "Teachers only" for a specific school.
2. **Push:** Server executes `sendBroadcastMessageAction` -> `pushSyncUpdateServer(ADMIN_BROADCAST_MESSAGE, { message, targetSchoolId, targetAudience, senderName })`.
3. **Poll:** Active browsers poll `/api/sync/poll`.
4. **Toast:** `usePollingUpdates` checks `targetAudience` against current screen (`isPrivateScreen` vs `isTeacherScreen`) and school ID, displaying an infinite closable Toast (`BroadcastToast`).

## Performance & Optimization
- **Batching:** Multiple changes are fetched in a single poll request.
- **No-Store:** The poll API uses `cache: "no-store"` to ensure fresh data.
- **Decoupled Messaging:** Broadcast text messages do not trigger table re-fetch operations.
- **Route Filtering:** Polling is disabled on static/history pages (FAQ, History, Statistics) to reduce unnecessary load.

