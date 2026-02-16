
# History Update Process

The History Update Service is a component responsible for archiving the daily schedule data into history table (`history`).

## Purpose

1.  **Archiving**: Moves confirmed schedule data (daily changes, events, instructions) to the permanent `history` table.
2.  **Snapshotting**: Creates a point-in-time record of what happened on a specific date for each school.
3.  **Data Pruning**: Removes old records from the `daily_schedule` table to maintain query performance.
4.  **Cache Management**: Invalidates relevant history caches to ensure users see up-to-date historical data.

## Invocation

The process is typically triggered by a scheduled job (Vercel Cron) that calls an API route (`/api/cron/history-update`) which internally executes `processHistoryUpdate(dateString)`.

It can also be triggered manually for backfilling or debugging purposes.

## Process Flow

The `processHistoryUpdate` function executes the following steps:

1.  **Identify Target Date**: Defaults to "today" (YYYY-MM-DD) if not provided.
2.  **Select Schools**: Fetches ALL schools from the `schools` table.
    *   *Optimization*: If no schools exist, it returns early.
3.  **Fetch Daily Schedules**: Queries the `daily_schedule` table for all records matching the target date and school IDs.
4.  **Prepare History Data**:
    *   Fetches reference data (Teachers, Subjects, Classes) to denormalize IDs into readable names for the history record.
    *   Maps each schedule entry to a history record object.
5.  **Atomic Database Operations**:
    *   **Constraint**: The application uses the `neon-http` driver which does **not** support interactive transactions (`db.transaction()`).
    *   **Solution**: We use `db.batch()` to execute multiple queries in a single HTTP request, ensuring atomicity.
    *   **Operations in Batch**:
        1.  **Delete Old History**: Removes any existing history records for the target date/schools to prevent duplicates (idempotency).
        2.  **Insert New History**: Inserts the prepared history records (only if records exist).
        3.  **Cleanup Daily Schedule**: Deletes records from `daily_schedule` older than `DAILY_KEEP_HISTORY_DAYS` (default: 30 days).
6.  **Cache Invalidation**:
    *   Iterates through all target schools.
    *   Invalidates cache tags:
        *   `history-[schoolId]`: Clears general history list for the school.
        *   `history-[schoolId]-[date]`: Clears specific date entry.
    *   *Note*: This uses `next/cache`'s `revalidateTag`.

## Technical Details

### Database Driver Limitations (`neon-http`)
The `neon-http` driver is stateless and communicates via HTTP, making standard interactive transactions impossible.
*   ❌ `db.transaction(async (tx) => { ... })` - Will fail with "No transactions support in neon-http driver".
*   ✅ `db.batch([ query1, query2, ... ])` - Supported and ensures all queries succeed or fail together.

### Empty Schedule Handling
Even on days with no schedule changes (e.g., holidays):
1.  The process still runs to ensure any **prefetching** or **cleanup** logic is executed.
2.  It explicitly deletes potential stale history for that date (e.g., if a schedule was deleted).
3.  It always triggers cache invalidation to reflect the "empty" state to end-users.

## Monitoring & Logging

*   Success: Logs the number of schools updated and records archived.
*   Failure: Logs critical errors with context (target date, error message).
*   All logs are sent to the application's logging service (e.g., database logs or external aggregator).
