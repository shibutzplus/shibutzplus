import { NextResponse } from 'next/server';
import { processHistoryUpdate } from '@/services/history/updateHistory';

// ==============================================================================
// HISTORY SCHEDULE UPDATE PROCESS
// ==============================================================================
// This API endpoint handles the daily archiving of "DailySchedule" into "History".
//
// PROCESS:
// 1. It identifies "Yesterday" (or a specific date provided manually).
// 2. It finds all schools that have PUBLISHED the schedule for that date.
// 3. It fetches the DailySchedule records for those schools/dates.
// 4. It archives them into the "history" table.
//
// TRIGGERS:
// 1. Vercel Cron Job: configured in `vercel.json` (runs daily).
// 2. Manual Trigger: via `/historyUpdateManual` page (admin internal tool).
//
// RELATED FILES:
// - Logic: `src/services/history/updateHistory.ts` (Core logic residing here)
// - Manual Action: `src/app/actions/POST/runHistoryUpdateAction.ts`
// - Manual UI: `src/app/(private)/historyUpdateManual/page.tsx`
// - Config: `vercel.json` (Cron schedule)
// ==============================================================================

export const maxDuration = 60;
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    try {
        const result = await processHistoryUpdate();

        return NextResponse.json({
            success: result.success,
            message: `History processed.`,
            schoolsUpdated: result.schoolsUpdated,
            recordsCount: result.recordsCount,
            logs: result.logs
        });

    } catch (error) {
        console.error('Cron job failed:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}