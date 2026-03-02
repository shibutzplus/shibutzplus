//
// One-time script to copy all data from annual_schedule to annual_schedule_alt
//
// How to run:
// npx tsx scripts/copy_annual_to_alt.ts
//
// Why to run?
// Populates the alt (emergency) schedule table with current annual schedule data.
// Run this script once after the migration.
//
import { loadEnv } from '../src/db/load-env';

// Load env vars first
loadEnv();

async function main() {
    const { db } = await import('../src/db');
    const { schema } = await import('../src/db');
    const { createId } = await import('@paralleldrive/cuid2');

    console.log('--- Copy Annual Schedule to Alt - Start ---');

    try {
        // Fetch all rows from annual_schedule
        const rows = await db.select().from(schema.annualSchedule);
        console.log(`Found ${rows.length} rows in annual_schedule`);

        if (rows.length === 0) {
            console.log('No rows to copy.');
            return;
        }

        // Insert into annual_schedule_alt in batches of 100
        const batchSize = 100;
        let inserted = 0;

        for (let i = 0; i < rows.length; i += batchSize) {
            const batch = rows.slice(i, i + batchSize).map((row) => ({
                id: createId(),
                day: row.day,
                hour: row.hour,
                schoolId: row.schoolId,
                classId: row.classId,
                teacherId: row.teacherId,
                subjectId: row.subjectId,
                createdAt: new Date(),
                updatedAt: new Date(),
            }));

            await db.insert(schema.annualScheduleAlt).values(batch);
            inserted += batch.length;
            console.log(`Inserted ${inserted} / ${rows.length} rows...`);
        }

        console.log(`Done! Copied ${inserted} rows to annual_schedule_alt.`);
    } catch (error) {
        console.error('Error copying data:', error);
        throw error;
    }

    console.log('--- Copy Annual Schedule to Alt - End ---');
}

main().catch(console.error).finally(() => process.exit());
