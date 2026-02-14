# System Architecture - Shibutz Plus

## Overview
Shibutz Plus is a platform for managing and publishing school schedules and substitution materials.

## Tech Stack
- **Framework:** Next.js (App Router)
- **Database:** PostgreSQL (with Drizzle ORM)
- **Language:** TypeScript
- **Styling:** Vanilla CSS / Tailwind (where requested)
- **Syncing:** Server-side sync service (Upstash/Postgres)
- **Notifications:** Web Push API (VAPID)

## Key Components

### 1. Database Schema (`src/db/schema`)
- `schools`: Core school information and publication dates.
- `teachers`: Teacher profiles, including roles (`regular`, `staff`, `substitute`).
- `classes`: Academic classes within the school.
- `subjects`: Subjects taught in the school.
- `annual-schedule`: The "static" base schedule (planned hours/teachers).
- `daily-schedule`: All daily variations, teacher absences, and substitutions.
- `history`: Archive of past daily schedules for historical tracking.
- `push-subscriptions`: Browser/device registrations for web push notifications.
- `users`: Private portal users (Principals/Administrators).
- `logs`: Application activity and error logs.

### 2. Services (`src/services`)
- `pushNotifications`: Logic for sending web push alerts (see [Push Notifications](push-notifications.md)).
- `sync`: Real-time update logic using Upstash Redis (see [Sync Service](sync-service.md)).
- `caching`: High-performance data fetching using Next.js Cache (see [Cache Mechanism](cache-mechanism.md)).
- `loggerService`: Centralized database logging for errors and actions.

### 3. Server Actions (`src/app/actions`)
All database mutations are handled via server actions, divided into `GET` and `POST` subdirectories.

### 4. Public Portal (`src/app/(public)`)
Pages accessible to teachers without a full login, mainly for viewing schedules and materials.
- `/teacher-material/[schoolId]`: General materials page.
- `/teacher-material/[schoolId]/[teacherId]`: Personalized teacher page.
