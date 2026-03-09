//
// One-time script to copy all data from annual_schedule to annual_schedule_alt
//
// How to run:
// npx tsx scripts/copy_annual_to_alt.ts <school_id>
//
import { loadEnv } from '../src/db/load-env';

// Load env vars first
loadEnv();

async function main() {
    const { db } = await import('../src/db');
    const { schema } = await import('../src/db');
    const { createId } = await import('@paralleldrive/cuid2');

    const targetSchoolId = process.argv[2];
    if (!targetSchoolId) {
        console.error('Error: Please provide a school ID as an argument.');
        console.error('Example: npx tsx scripts/copy_annual_to_alt.ts <school_id>');
        process.exit(1);
    }

    const { eq } = await import('drizzle-orm');

    console.log(`--- Copy Annual Schedule to Alt for School: ${targetSchoolId} - Start ---`);

    try {
        // Fetch rows from annual_schedule for the specified school
        const rows = await db.select().from(schema.annualSchedule).where(eq(schema.annualSchedule.schoolId, targetSchoolId));
        console.log(`Found ${rows.length} rows in annual_schedule for school ${targetSchoolId}`);

        if (rows.length === 0) {
            console.log('No rows to copy.');
            return;
        }

        console.log(`Deleting existing rows in annual_schedule_alt for school ${targetSchoolId}...`);
        await db.delete(schema.annualScheduleAlt).where(eq(schema.annualScheduleAlt.schoolId, targetSchoolId));

        // Note: Standing scripts can't call revalidateTag() easily.
        // In local development, we can wipe the .next/cache folder to force a refresh.
        const fs = await import('fs');
        const path = await import('path');
        const cachePath = path.resolve(__dirname, '../.next/cache');
        if (fs.existsSync(cachePath)) {
            console.log('Clearing Next.js cache folder...');
            fs.rmSync(cachePath, { recursive: true, force: true });
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
