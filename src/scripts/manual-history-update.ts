
import { config } from 'dotenv';
import path from 'path';

// Load environment variables first
// We do this before importing any application code to ensure DB connection gets the env vars
config({ path: path.resolve(process.cwd(), '.env') });
config({ path: path.resolve(process.cwd(), '.env.local') });

async function main() {
    console.log('Starting manual history update verification...');

    try {
        // Dynamically import the service AFTER env vars are loaded
        const { processHistoryUpdate } = await import('@/services/history/updateHistory');

        const today = new Date().toISOString().split('T')[0];
        console.log(`Target date: ${today}`);

        const result = await processHistoryUpdate(today);
        console.log('Update result:', JSON.stringify(result, null, 2));

        if (result.success) {
            console.log('✅ History update succeeded.');
            process.exit(0);
        } else {
            console.error('❌ History update reported failure.');
            process.exit(1);
        }
    } catch (error) {
        console.error('❌ Update script crashed:', error);
        process.exit(1);
    }
}

main();
