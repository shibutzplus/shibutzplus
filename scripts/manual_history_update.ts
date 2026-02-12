//
// How to run:
// npx tsx scripts/manual_history_update.ts YYYY-MM-DD
//
// Example:
// npx tsx scripts/manual_history_update.ts 2026-02-12
//
// Why to run?
// The history update script failed to run for some reason, so we need to run it manually.
//
import { loadEnv } from '../src/db/load-env';

// Load env vars first
loadEnv();

async function main() {
    // Import dynamically
    const { processHistoryUpdate } = await import('../src/services/history/updateHistory');

    console.log('--- Manual History Update Start ---');

    // Get date from command line args or default to yesterday
    const args = process.argv.slice(2);
    let targetDate = args[0];

    if (!targetDate) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        targetDate = yesterday.toISOString().split('T')[0];
        console.log(`No date provided, defaulting to yesterday: ${targetDate}`);
        console.log('Usage: npx tsx scripts/manual_history_update.ts YYYY-MM-DD');
    }

    console.log(`Processing history for date: ${targetDate}`);

    try {
        const result = await processHistoryUpdate(targetDate);
        console.log('Result:', JSON.stringify(result, null, 2));
    } catch (error) {
        console.error('Error running history update:', error);
    }
    console.log('--- Manual History Update End ---');
}

main().catch(console.error).finally(() => process.exit());
