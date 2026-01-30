import { NextResponse } from 'next/server';
import { processHistoryUpdate } from '@/services/history/updateHistory';
import { dbLog } from '@/services/loggerService';

// ==============================================================================
// HISTORY SCHEDULE UPDATE PROCESS
// ==============================================================================
// This API endpoint handles the daily archiving of "DailySchedule" into "History".
//
// PROCESS:
// 1. It identifies "Today" (or a specific date provided manually).
// 2. It finds all schools for that date.
// 3. It fetches the DailySchedule records for those schools/date.
// 4. It archives them into the "history" table.
// 5. It cleans up "DailySchedule" records older than 4 days.
//
// TRIGGERS:
// Vercel Cron Job: configured in `vercel.json`
// runs daily at 16:00 UTC (after ~18:00 IL time), Sun-Fri (does not run on Saturday).
//
// RELATED FILES:
// - Logic: `src/services/history/updateHistory.ts` (Core logic residing here)


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
        dbLog({ description: `Cron job (history-update) failed: ${error instanceof Error ? error.message : String(error)}` });
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}