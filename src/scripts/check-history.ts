
import { config } from 'dotenv';
import path from 'path';

// Load environment variables first
config({ path: path.resolve(process.cwd(), '.env') });
config({ path: path.resolve(process.cwd(), '.env.local') });

async function main() {
    console.log('Checking history records...');

    try {
        // Dynamically import DB modules AFTER env vars are loaded
        const { db } = await import('@/db');
        const { history, schools } = await import('@/db/schema');
        const { eq, and } = await import('drizzle-orm');

        const today = new Date().toISOString().split('T')[0];
        console.log(`Target date: ${today}`);

        // Get all schools to check
        const allSchools = await db.select().from(schools);
        console.log(`Found ${allSchools.length} schools.`);

        for (const school of allSchools) {
            const records = await db
                .select()
                .from(history)
                .where(
                    and(
                        eq(history.schoolId, school.id),
                        eq(history.date, today)
                    )
                );

            console.log(`School: ${school.name} (ID: ${school.id}) - Found ${records.length} history records.`);
            if (records.length > 0) {
                console.log('Sample record (first one):');
                console.log(JSON.stringify(records[0], null, 2));
            }
        }

        process.exit(0);

    } catch (error) {
        console.error('❌ Check script crashed:', error);
        process.exit(1);
    }
}

main();
