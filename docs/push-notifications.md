# Web Push Notifications

## Overview
The system uses the Web Push API and VAPID protocol to send notifications to teachers when the school schedule is published.

## Implementation Details

### Client-Side (`src/hooks/usePushNotifications.ts`)
- **Support Check:** Checks browser support and PWA installation (especially for iOS).
- **Registration:** Registers `sw.js` (Service Worker).
- **Subscription:** Requests user permission and creates a subscription using the public VAPID key.
- **API Call:** Sends the subscription object (`endpoint`, `p256dh`, `auth`) plus `schoolId` and `teacherId` to the backend.

### Server-Side (`src/services/pushNotifications/index.ts`)
- **VAPID Setup:** Uses `web-push` library with keys defined in `.env`.
- **`sendPublishNotification` (Specialized Trigger):** 
    - sends only to all teachers with roles `regular` or `staff` in the specified school.
    - **Batching:** Processes sends in batches of 50 with a small delay (10ms) between batches to prevent `socket hang up` errors and manage server resources.
    - **Retries:** Implements exponential backoff (up to 3 retries) for transient network errors (5xx, 429, ECONNRESET).

### Device & Browser Differences
The "Bell" icon (notification request) visibility depends on the platform:
- **iOS (iPhone/iPad):** Push notifications only work if the app is **installed as a PWA** (Standalone mode). The icon will only appear if the user has added the site to their Phone Home Screen.
- **Android / Desktop:** Notifications work directly in the browser. The icon appears if the browser supports the Push API, even without installation.

## Registration Processes

### Manual Registration (The "Bell" Flow)
If permission is `default` (not yet asked), a "Bell" icon appears in the header.
1. User clicks the Bell.
2. A custom confirmation popup (`NotificationRequestPopup`) explains why we need permission.
3. If confirmed, the browser's native permission dialog is shown.
4. Upon approval, the device is subscribed to the `PushManager` and the data is saved to the database.

### Unsubscription
Currently, there is no "Unsubscribe" button in the UI. 
- **Manual:** Users can revoke permission via their browser/system settings.
- **Automatic Cleanup:** If a notification send fails with a `410 Gone` or `404 Not Found` (meaning the user cleared their cache or revoked permission), the server **automatically deletes** that subscription from the database.

### Notification Workflow
1. User (Principal) clicks "Publish Schedule" in the dashboard.
2. `publishDailyScheduleAction` is triggered.
3. After updating the DB and sync state, it calls `sendPublishNotification`.
4. The Service Worker (`public/sw.js`) receives the push event and displays the notification.
5. Clicking the notification opens the relevant teacher material page.

## Configuration
Requires the following environment variables:
- `NEXT_PUBLIC_VAPID_PUBLIC_KEY`
- `VAPID_PRIVATE_KEY`
