//
// One-time script to revert teacher names for a specific school.
// Used after importing teachers from a Excel file where names are in "Last Name, First Name" format.
// Example: "AAA BBB" -> "BBB AAA"
//
// How to run:
// npx tsx scripts/reverse_teacher_names.ts
//
import { loadEnv } from '../src/db/load-env';

// Load env vars first
loadEnv();

async function main() {
    const { db } = await import('../src/db');
    const { schema } = await import('../src/db');
    const { eq } = await import('drizzle-orm');

    const targetSchoolId = 'x174kkynehw9zo6qqhqatybf';
    const isDryRun = process.argv.includes('--dry-run');

    console.log(`--- Revert Teacher Names for School: ${targetSchoolId} - Start ---`);
    if (isDryRun) {
        console.log('DRY RUN MODE: No changes will be saved to the database.');
    }

    try {
        // Fetch teachers for the specified school
        const teacherRows = await db.select().from(schema.teachers).where(eq(schema.teachers.schoolId, targetSchoolId));
        console.log(`Found ${teacherRows.length} teachers for school ${targetSchoolId}`);

        if (teacherRows.length === 0) {
            console.log('No teachers found to process.');
            return;
        }

        let updatedCount = 0;

        for (const teacher of teacherRows) {
            const originalName = teacher.name;
            // Revert logic: "AAA BBB" -> "BBB AAA"
            // We split by space, reverse the parts, and join back with a space.
            // This handles multiple names like "AAA BBB CCC" -> "CCC BBB AAA"
            const reversedName = originalName.split(' ').reverse().join(' ');

            if (originalName === reversedName) {
                console.log(`Skipping "${originalName}" (already symmetrical or single word).`);
                continue;
            }

            console.log(`Updating: "${originalName}" -> "${reversedName}"`);

            if (!isDryRun) {
                await db.update(schema.teachers)
                    .set({
                        name: reversedName,
                        updatedAt: new Date()
                    })
                    .where(eq(schema.teachers.id, teacher.id));
            }
            updatedCount++;
        }

        console.log(`\nDone! ${isDryRun ? 'Perviewed' : 'Updated'} ${updatedCount} teachers.`);
    } catch (error) {
        console.error('Error reverting teacher names:', error);
        throw error;
    }

    console.log('--- Revert Teacher Names - End ---');
}

main().catch(console.error).finally(() => process.exit());
