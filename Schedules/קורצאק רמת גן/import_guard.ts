/**
 * Script to import duty schedule (תורנויות) for school "קורצ'אק רמת גן" (school_id: s3z2imwnpaxetpupvr1u29zd)
 * Source: מערכת תורנויות יומית (לוח תורנויות שבועי)
 * 
 * Usage:
 *   npx tsx "Schedules/קורצאק רמת גן/import_guard.ts"             # Dry-run mode (prints preview only, NO DB changes)
 *   npx tsx "Schedules/קורצאק רמת גן/import_guard.ts" --execute   # Writes to database for the specified week
 */

import { loadEnv } from "../../src/db/load-env";
loadEnv();

import { createId } from "@paralleldrive/cuid2";

export const SCHOOL_ID = "s3z2imwnpaxetpupvr1u29zd"; // בית ספר "קורצ'אק"

// Dates starting from today: Sunday 01/11/2026 through the cycle of weekdays
export const TARGET_DATES: Record<number, string> = {
    1: "2026-11-01", // יום ראשון
    2: "2026-11-02", // יום שני
    3: "2026-11-03", // יום שלישי
    4: "2026-11-04", // יום רביעי
    5: "2026-11-05", // יום חמישי
    6: "2026-11-06", // יום שישי
};

export const DAY_ORDER = [1, 2, 3, 4, 5, 6];

export const DAY_NAMES: Record<number, string> = {
    1: "יום ראשון",
    2: "יום שני",
    3: "יום שלישי",
    4: "יום רביעי",
    5: "יום חמישי",
    6: "יום שישי",
};

/**
 * Mapping of short / table names to exact full name and ID in database
 */
export const TEACHER_MAP: Record<string, { fullName: string; id: string }> = {
    "אביב סלומון": { fullName: "אביב סלומון", id: "woeu1jzynspsu1m80j09s11d" },
    "אביגיל ברדה": { fullName: "אביגיל ברדה", id: "tqr2lnrw7i511ki1s056uybm" },
    "אביה אלוני": { fullName: "אביה אלוני", id: "npfaqsjnyjfmupk85amhwt3t" },
    "אורלי": { fullName: "אורלי כדורי", id: "ujf8xa1kxa64rqiqm76s5kt8" },
    "אורלי כדורי": { fullName: "אורלי כדורי", id: "ujf8xa1kxa64rqiqm76s5kt8" },
    "איילת אזורי": { fullName: "איילת עזורי", id: "pfs1kf84h6ngvsli82e547mo" },
    "איילת עזורי": { fullName: "איילת עזורי", id: "pfs1kf84h6ngvsli82e547mo" },
    "אפרת מויאל": { fullName: "אפרת מויאל", id: "ztbre5idbqey43vzsefcn6m1" },
    "גבי": { fullName: "גבריאל קמינסקי", id: "hpnkpyrox2xa4q2miofrevb3" },
    "גבריאל קמינסקי": { fullName: "גבריאל קמינסקי", id: "hpnkpyrox2xa4q2miofrevb3" },
    "דוד גלפונד": { fullName: "דוד גלפונד", id: "j85x7abh2wndlb6yanzulvyi" },
    "הדס": { fullName: "הדס צוברה", id: "wou03rwt7bsqp7o448xj9ss2" },
    "הדס צוברה": { fullName: "הדס צוברה", id: "wou03rwt7bsqp7o448xj9ss2" },
    "הילה מויאל": { fullName: "הילה מויאל", id: "c7y5x4b4bqsbssed2p7sbhrf" },
    "הלנה": { fullName: "הלנה עובדיה", id: "pmzyk57u50poads0gwvxzhoc" },
    "הלנה עובדיה": { fullName: "הלנה עובדיה", id: "pmzyk57u50poads0gwvxzhoc" },
    "ורד": { fullName: "ורד רדושיצקי", id: "terv1bq9bfoqf5cvds1jclri" },
    "ורד רדושיצקי": { fullName: "ורד רדושיצקי", id: "terv1bq9bfoqf5cvds1jclri" },
    "זוהר": { fullName: "זוהר קן תור", id: "edfnsq2pxhyn86nstdo2pw6f" },
    "זוהר קן תור": { fullName: "זוהר קן תור", id: "edfnsq2pxhyn86nstdo2pw6f" },
    "חן הלל": { fullName: "חן הלל", id: "k5ffn3rvxu6ryc7rlul2hfte" },
    "חני": { fullName: "חני רוזנפלד", id: "g1j6urfhe2kdtdonvesh1hwf" },
    "חני רוזנפלד": { fullName: "חני רוזנפלד", id: "g1j6urfhe2kdtdonvesh1hwf" },
    "טליה מדמוני": { fullName: "טליה מדמוני", id: "a48qxe6ula0v779ubgqbjou4" },
    "יובל כץ": { fullName: "יובל כץ", id: "ekl5fui50wkpahoghq7j68wu" },
    "ימית": { fullName: "ימית סגילוביץ", id: "l2tc3f8l76brrb7srdrlik15" },
    "ימית סגילוביץ": { fullName: "ימית סגילוביץ", id: "l2tc3f8l76brrb7srdrlik15" },
    "לאה איכר": { fullName: "לאה איכר", id: "wh17c79vwijfs2ph1u87qj5y" },
    "מיטל קריגר": { fullName: "מיטל קריגר", id: "u35k65dj4carhrl0xfq84emc" },
    "מיכל סהר": { fullName: "מיכל סהר", id: "anh9myaql12lcrsm5pe189kk" },
    "מיכל פלדשטיין": { fullName: "מיכל פלדשטיין", id: "k0x45qir0rpvxn0tkgo8fzkp" },
    "נופר לוין": { fullName: "נופר לוין", id: "ghbcaufxjy8e7gy7econsu5v" },
    "סיון": { fullName: "סיון זמיר", id: "fgpgducwm6pz84s3zszutnut" },
    "סיון זמיר": { fullName: "סיון זמיר", id: "fgpgducwm6pz84s3zszutnut" },
    "סיון זמיר-צייטלין": { fullName: "סיון זמיר", id: "fgpgducwm6pz84s3zszutnut" },
    "סימה": { fullName: "סימה", id: "fa9iiajux347cejq8o1pe7o5" },
    "סתיו כרים": { fullName: "סתיו כרים", id: "qjc82670y22iw1yqakdgjfcx" },
    "עדי קפלן": { fullName: "עדי קפלן", id: "j0p0mv4nhfi8wxesw5370fnj" },
    "רון ברטל": { fullName: "רון ברטל", id: "n66bdrid4e3uqvcrqwujnbhp" },
    "רותי גלבר": { fullName: "רותי גלבר", id: "qy9s550k0c9cthl31ql080tb" },
    "שחף": { fullName: "שחף מויאל", id: "japminp4y6udvejh97mecmck" },
    "שחף מויאל": { fullName: "שחף מויאל", id: "japminp4y6udvejh97mecmck" },
    "שירה צדוק": { fullName: "שירה צדוק", id: "b5elnf7hjra34ejbpp8xz10b" },
    "שלומית פינקלשטיין": { fullName: "שלומית פינקלשטיין", id: "dk68ecpkpxfw33pttl7khr70" },
    "שמואל": { fullName: "שמואל חמו", id: "ljoeukjunsok7uh9t2p61i6j" },
    "שמואל חמו": { fullName: "שמואל חמו", id: "ljoeukjunsok7uh9t2p61i6j" },
    "שני בדיחי": { fullName: "שני בדיחי", id: "d8gphql3xicqslevut6gnb2j" },
};

export type DayAssignment = string | string[] | null;

export interface ShiftDefinition {
    hour: number;
    title: string;
    // Row definitions: [location, [Sun, Mon, Tue, Wed, Thu, Fri]]
    rows: [string, DayAssignment[]][];
}

export const SHIFTS: ShiftDefinition[] = [
    {
        hour: 1,
        title: "הפסקה קטנה (07:45-08:00)",
        rows: [
            ["החצר האחורית", ["טליה מדמוני", "חן הלל", "אורלי כדורי", "שירה צדוק", "חן הלל", "רותי גלבר"]],
            ["הבמה, החצר המקורה וקיר הטיפוס", ["אביה אלוני", "סתיו כרים", "איילת אזורי", "אביה אלוני", "סתיו כרים", "מיטל קריגר"]],
            ["משער הכניסה ממ\"דים ועד למגרש כדורגל", [["זוהר", "שלומית פינקלשטיין"], "רון ברטל", "גבי", "הלנה", "ימית", ["איילת אזורי", "הילה מויאל"]]],
            ["מגרש כדורגל", ["דוד גלפונד", "שמואל חמו", "יובל כץ", "דוד גלפונד", "סיון", "יובל כץ"]],
            ["קומה א'", ["הדס", "סימה", "אביגיל ברדה", "שלומית פינקלשטיין", "חני", "מיכל פלדשטיין"]],
            ["קומה ב'", ["נופר לוין", "מיכל סהר", "נופר לוין", "שחף", "ורד רדושיצקי", "סיון זמיר-צייטלין"]],
            ["קומה ג'", ["אביב סלומון", "שני בדיחי", "לאה איכר", "הילה מויאל", "אפרת מויאל", "עדי קפלן"]],
        ],
    },
    {
        hour: 3,
        title: "הפסקה גדולה (09:50-10:15)",
        rows: [
            ["החצר האחורית", ["טליה מדמוני", "חן הלל", "אורלי כדורי", "שירה צדוק", "חן הלל", "רותי גלבר"]],
            ["הבמה, החצר המקורה וקיר הטיפוס", ["אביה אלוני", "סתיו כרים", "איילת אזורי", "אביה אלוני", "סתיו כרים", "מיטל קריגר"]],
            ["משער הכניסה ממ\"דים ועד למגרש כדורגל", [["זוהר", "שלומית פינקלשטיין"], "רון ברטל", "גבי", "הלנה", "ימית", ["איילת אזורי", "הילה מויאל"]]],
            ["מגרש כדורגל", ["דוד גלפונד", "שמואל חמו", "יובל כץ", "דוד גלפונד", "סיון", "יובל כץ"]],
            ["קומה א'", ["הדס", "סימה", "אביגיל ברדה", "שלומית פינקלשטיין", "חני", "מיכל פלדשטיין"]],
            ["קומה ב'", ["נופר לוין", "מיכל סהר", "נופר לוין", "שחף", "ורד רדושיצקי", "סיון זמיר-צייטלין"]],
            ["קומה ג'", ["אביב סלומון", "שני בדיחי", "לאה איכר", "הילה מויאל", "אפרת מויאל", "עדי קפלן"]],
        ],
    },
    {
        hour: 4,
        title: "הפסקה קטנה (11:45-12:00)",
        rows: [
            ["החצר האחורית", ["טליה מדמוני", "חן הלל", "אורלי כדורי", "שירה צדוק", "רותי גלבר", null]],
            ["הבמה, החצר המקורה וקיר הטיפוס", ["אביה אלוני", "אביב סלומון", "איילת אזורי", "אפרת מויאל", "סתיו כרים", null]],
            ["משער הכניסה ממ\"דים ועד למגרש כדורגל", [["זוהר", "שלומית פינקלשטיין"], "אורלי", "הלנה", "הלנה", "ימית", null]],
            ["מגרש כדורגל", ["ימית", "שמואל חמו", "יובל כץ", "דוד גלפונד", "שני בדיחי", null]],
            ["קומה א'", ["הדס", "מיטל קריגר", "שירה צדוק", "סימה", "הדס", null]],
            ["קומה ב'", ["ורד", "מיכל סהר", "נופר לוין", "שמואל", "ורד רדושיצקי", null]],
            ["קומה ג'", ["אביב סלומון", "שני בדיחי", "לאה איכר", "הילה מויאל", "אפרת מויאל", null]],
        ],
    },
];

async function main() {
    const isExecute = process.argv.includes("--execute");
    const isProd = process.argv.includes("--prod");

    if (isProd) {
        if (!process.env.DATABASE_URL) {
            throw new Error("DATABASE_URL is not set in environment variables");
        }
        (process.env as Record<string, string | undefined>).NODE_ENV = "production";
    }

    console.log("==================================================================");
    console.log(` ייבוא תורנויות - בית ספר קורצ'אק (מצב: ${isExecute ? "ביצוע ל-DB" : "סימולציה בלבד (Dry-Run)"} | מסד נתונים: ${isProd ? "PRODUCTION" : "STAGING"})`);
    console.log("==================================================================\n");

    // Dynamic import DB only if needed
    let db: any, schema: any, executeQuery: any;
    const maxPosMap = new Map<string, number>();
    if (isExecute) {
        const dbModule = await import("../../src/db");
        const { and, eq, inArray, max } = await import("drizzle-orm");
        db = dbModule.db;
        schema = dbModule.schema;
        executeQuery = dbModule.executeQuery;

        const maxPosRows = await executeQuery(() =>
            db
                .select({
                    date: schema.dailySchedule.date,
                    maxPos: max(schema.dailySchedule.position),
                })
                .from(schema.dailySchedule)
                .where(
                    and(
                        eq(schema.dailySchedule.schoolId, SCHOOL_ID),
                        inArray(schema.dailySchedule.date, Object.values(TARGET_DATES)),
                    ),
                )
                .groupBy(schema.dailySchedule.date),
        );
        for (const r of maxPosRows) {
            maxPosMap.set(r.date, r.maxPos ?? 1000);
        }
    }

    // Process days in order starting from Sunday
    for (const day of DAY_ORDER) {
        const dateStr = TARGET_DATES[day];
        const dayName = DAY_NAMES[day];
        // Generate non-recurring column ID (standard cuid)
        const columnId = createId();
        const nextPosition = (maxPosMap.get(dateStr) ?? 1000) + 1000;

        console.log(`\n-------------------------------------------------------------`);
        console.log(` ${dayName} (${dateStr}) | Column ID: ${columnId} | Position: ${nextPosition}`);
        console.log(`-------------------------------------------------------------`);

        // Rows to insert for this day
        const rowsToInsert: any[] = [];

        // 1. Header row (hour: -1)
        rowsToInsert.push({
            id: createId(),
            schoolId: SCHOOL_ID,
            date: dateStr,
            day: day,
            hour: -1,
            columnId: columnId,
            position: nextPosition,
            columnType: 3, // ColumnTypeValues.guard
            eventTitle: "תורנויות",
            event: "",
            instructions: null,
            guardTeacherIds: null,
        });

        // 2. Each shift
        for (const shift of SHIFTS) {
            const shiftTeachers: string[] = [];
            const instructionsMap: Record<string, string> = {};

            for (const [location, daysList] of shift.rows) {
                const assigned = daysList[day - 1];
                if (!assigned) continue;

                const teachersList = Array.isArray(assigned) ? assigned : [assigned];

                for (const teacherShort of teachersList) {
                    const mapped = TEACHER_MAP[teacherShort];
                    if (!mapped) {
                        throw new Error(`Teacher '${teacherShort}' not found in TEACHER_MAP!`);
                    }

                    shiftTeachers.push(mapped.id);
                    instructionsMap[mapped.id] = location;
                }
            }

            if (shiftTeachers.length === 0) continue; // E.g., Friday shift 3

            rowsToInsert.push({
                id: createId(),
                schoolId: SCHOOL_ID,
                date: dateStr,
                day: day,
                hour: shift.hour,
                columnId: columnId,
                position: nextPosition,
                columnType: 3, // ColumnTypeValues.guard
                eventTitle: "תורנויות",
                event: shift.title,
                instructions: JSON.stringify(instructionsMap),
                guardTeacherIds: shiftTeachers,
            });

            console.log(`  * שעה ${shift.hour}: ${shift.title} (${shiftTeachers.length} תורנים):`);
            for (const tId of shiftTeachers) {
                const shortName = Object.keys(TEACHER_MAP).find(k => TEACHER_MAP[k].id === tId);
                const fullInfo = TEACHER_MAP[shortName!];
                console.log(`      - ${fullInfo.fullName} (${instructionsMap[tId]})`);
            }
        }

        if (isExecute) {
            console.log(`  -> שומר ${rowsToInsert.length} שורות למסד הנתונים עבור ${dateStr}...`);
            await executeQuery(() => db.insert(schema.dailySchedule).values(rowsToInsert));
            console.log(`  -> נשמר בהצלחה!`);
        }
    }

    console.log("\n==================================================================");
    if (!isExecute) {
        console.log(" סימולציה (Dry-Run) הסתיימה בהצלחה. לא בוצעו שינויים במסד הנתונים.");
        console.log(" להרצה בפועל, הרץ עם הדגל: --execute");
    } else {
        console.log(" כל התורנויות לשבוע היעד הוזנו בהצלחה למסד הנתונים!");
    }
    console.log("==================================================================\n");
}

main().catch(console.error).finally(() => process.exit(0));

