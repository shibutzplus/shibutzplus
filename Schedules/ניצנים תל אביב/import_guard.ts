/**
 * Script to import duty schedule (תורנויות) for school "ניצנים תל אביב" (school_id: isfxl6jyrrhrmua8zkj9suyv)
 * Source: עמודות אירועים בימים ב'-ה' (הועתקו לעמודות תורנויות תקניות בדומה ליום א')
 *
 * Usage:
 *   npx tsx "Schedules/ניצנים תל אביב/import_guard.ts"             # Dry-run mode (prints preview only, NO DB changes)
 *   npx tsx "Schedules/ניצנים תל אביב/import_guard.ts" --execute   # Writes to database for the specified week
 */

import { loadEnv } from "../../src/db/load-env";
loadEnv();

import { createId } from "@paralleldrive/cuid2";

export const SCHOOL_ID = "isfxl6jyrrhrmua8zkj9suyv"; // בית ספר "ניצנים" תל אביב יפו

// Dates for Monday–Thursday (Sunday already has a guard column; Friday has no duties)
export const TARGET_DATES: Record<number, string> = {
    2: "2026-11-02", // יום שני
    3: "2026-11-03", // יום שלישי
    4: "2026-11-04", // יום רביעי
    5: "2026-11-05", // יום חמישי
};

export const DAY_ORDER = [2, 3, 4, 5];

export const DAY_NAMES: Record<number, string> = {
    2: "יום שני",
    3: "יום שלישי",
    4: "יום רביעי",
    5: "יום חמישי",
};

/**
 * Mapping of short / table names to exact full name and ID in database
 * Note: "אפרת שער" works only on Wednesdays (מגמות), so "אפרת" on Mon & Thu is "אפרת גולדשטיין".
 */
export const TEACHER_MAP: Record<string, { fullName: string; id: string }> = {
    "אורי": { fullName: "אורי לוי", id: "nv98q1pjtrcd5ee841jrn3pt" },
    "אורין": { fullName: "אורין טוויזר", id: "vu0yvaocibv3qb6yhuh4n4rz" },
    "אירינה": { fullName: "ספיר אירינה", id: "x3dvdh2n8r606790fyw91ljc" },
    "אפרת": { fullName: "אפרת גולדשטיין", id: "owc4bemp668t7sdjylfp6uj5" },
    "גלי": { fullName: "גלי לבל", id: "fbk3q7owwnn4ahd1s05x0ayc" },
    "גלית": { fullName: "גלית נאמן", id: "sqv5zq8y5rneb90gyzhfqvyq" },
    "דור": { fullName: "דור קרקובר", id: "tlr78538owylbpkpgbhcqok6" },
    "דנה": { fullName: "דנה טל", id: "rz3uv69yppetd2vx0zpfa1i5" },
    "ויקי": { fullName: "ויקי רביבו", id: "j8d0iywoyr1qf7bx0cqkswd7" },
    "יובל": { fullName: "יובל פייסר", id: "bufcku9e00y2dhkkz4nyy1tg" },
    "יוני": { fullName: "יוני גרא", id: "m6hv6l3mhandj52aytoeubq9" },
    "לירון": { fullName: "לירון סכר", id: "y8aj3i98hkkxackxy65e59ph" },
    "מאיה": { fullName: "מאיה לבל", id: "j0d34ktmr9zwljemm2b1rrpa" },
    "מוניק": { fullName: "מוניק איליי", id: "o8q4cxq5shy73131pnxfkmrk" },
    "מיכל": { fullName: "מיכל כהן", id: "di5onjlh0g9348dwoi3aa954" },
    "מעין": { fullName: "מעין זהבי", id: "spjylt6dddyebjp794r06i4o" },
    "נועה": { fullName: "נועה עייש שדה", id: "hcn0wjrwgqnji1tly1t7gkce" },
    "נעמה": { fullName: "נעמה טפר", id: "a7l0m7ont9r6f6glcmzo6yy2" },
    "עירית": { fullName: "עירית שטרן", id: "mk5r3hjixc46mhy2lbfoh86x" },
    "עפרה": { fullName: "עופרה כהן", id: "aune95iscedcnjbcgcih7qfp" },
    "ריקי": { fullName: "ריקי באגר", id: "ymgblc2ly806b8ajn7hdy1ae" },
    "שחף": { fullName: "שחף חרוש ארמי", id: "l7b9lb8fsxl0620ldxrf8h9x" },
    "שיר ל": { fullName: "שיר לוינטר", id: "alf6t9ev7nczj3t00dyijvj1" },
    "שיר.ל": { fullName: "שיר לוינטר", id: "alf6t9ev7nczj3t00dyijvj1" },
    "שיר ס": { fullName: "שיר ספדיה", id: "rz4k6mnopq9w0v69irdauqit" },
    "שיר .ס": { fullName: "שיר ספדיה", id: "rz4k6mnopq9w0v69irdauqit" },
    "שני ו": { fullName: "שני וויס", id: "snnxoditlscmnzaekr3e8nuo" },
    "שני ש": { fullName: "שני שטרית", id: "cs9d4aiye8ceywruimdnzwk8" },
    "שני.ש": { fullName: "שני שטרית", id: "cs9d4aiye8ceywruimdnzwk8" },
};

export type DayAssignment = string | string[] | null;

export interface ShiftDefinition {
    hour: number;
    title: string;
    // Row definitions: [location, [Mon (day 2), Tue (day 3), Wed (day 4), Thu (day 5)]]
    rows: [string, DayAssignment[]][];
}

// Aligned with Sunday's guard column format: hours 1, 3, 5 and titles "בוקר", "הפסקה גדולה", "הפסקה קטנה"
export const SHIFTS: ShiftDefinition[] = [
    {
        hour: 1,
        title: "בוקר",
        rows: [
            ["חצר", ["מאיה", "מעין", "יוני", "אירינה"]],
            ["מתקנים", ["אפרת", "עירית", "שיר ס", "גלית"]],
        ],
    },
    {
        hour: 3,
        title: "הפסקה גדולה",
        rows: [
            ["חצר", ["דנה", "מיכל", "אורין", "אירינה"]],
            ["מתקנים", ["שיר.ל", "גלית", "יובל", "נועה"]],
            ["מסדרון ישן", ["שני.ש", "נעמה", "גלי", "אפרת"]],
            ["מסדרון חדש", ["שיר .ס", "מוניק", "ריקי", "לירון"]],
        ],
    },
    {
        hour: 5,
        title: "הפסקה קטנה",
        rows: [
            ["חצר", ["דור", "עירית", "דנה", "אורין"]],
            ["מתקנים", ["מעין", "נעמה", "שיר ל", "שני ו"]],
            ["מסדרון ישן", ["גלי", "שני ש", "נועה", "אורי"]],
            ["מסדרון חדש", ["ריקי", "שחף", "עפרה", "ויקי"]],
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
    console.log(` ייבוא תורנויות - בית ספר ניצנים תל אביב (מצב: ${isExecute ? "ביצוע ל-DB" : "סימולציה בלבד (Dry-Run)"} | מסד נתונים: ${isProd ? "PRODUCTION" : "STAGING"})`);
    console.log("==================================================================\n");

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

    for (const day of DAY_ORDER) {
        const dateStr = TARGET_DATES[day];
        const dayName = DAY_NAMES[day];
        const dayIndex = day - 2; // 0 for Mon (2), 1 for Tue (3), 2 for Wed (4), 3 for Thu (5)
        const columnId = createId();
        const nextPosition = (maxPosMap.get(dateStr) ?? 1000) + 1000;

        console.log(`\n-------------------------------------------------------------`);
        console.log(` ${dayName} (${dateStr}) | Column ID: ${columnId} | Position: ${nextPosition}`);
        console.log(`-------------------------------------------------------------`);

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
                const assigned = daysList[dayIndex];
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

            if (shiftTeachers.length === 0) continue;

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
        console.log(" כל התורנויות לימים ב'-ה' הוזנו בהצלחה למסד הנתונים!");
    }
    console.log("==================================================================\n");
}

main().catch(console.error).finally(() => process.exit(0));

