/**
 * Script to import duty schedule (תורנויות) for school "יצחק נבון אור יהודה" (school_id: tffl6188m9mum6w962rvj47u)
 * Source PDF: ./לוח תורנויות.pdf
 * 
 * Usage:
 *   npx tsx "Schedules/יצחק נבון אור יהודה/import_guard.ts"             # Dry-run mode (prints preview only, NO DB changes)
 *   npx tsx "Schedules/יצחק נבון אור יהודה/import_guard.ts" --execute   # Writes to database for the specified week
 */

import { loadEnv } from "../../src/db/load-env";
loadEnv();

import { createId } from "@paralleldrive/cuid2";

export const SCHOOL_ID = "tffl6188m9mum6w962rvj47u"; // בית ספר "יצחק נבון"

// Dates starting from today: Sunday 01/11/2026 through Friday 06/11/2026
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
 * Mapping of short names in PDF to exact full name and ID in database
 */
export const TEACHER_MAP: Record<string, { fullName: string; id: string }> = {
    "אדן": { fullName: "אדן יחזקאל", id: "gamsqe8j8h0h0s74twdqxz1c" },
    "אודליה מ": { fullName: "אודליה מסה", id: "xegy93zcf6ske2cn0iqmwuyb" },
    "אודליה. מ": { fullName: "אודליה מסה", id: "xegy93zcf6ske2cn0iqmwuyb" },
    "אורטל": { fullName: "אורטל אשר", id: "js81nwwo4vlzwnyok0aug0wr" },
    "אורנה": { fullName: "אורנה מולה", id: "ooeb4fikv7mxj9w3xe4bz0lj" },
    "אילנית": { fullName: "אילנית ימין", id: "coq11c7xtmiaj1xnlrqif7jk" },
    "איריס.ש": { fullName: "איריס שטח", id: "mpi2zc10czv08io2re7m9yb4" },
    "אלה": { fullName: "אלה בן ברוך", id: "oyge2916mv9n9161lws967tf" },
    "אסנת": { fullName: "אסנת קרבצוב", id: "ov9ydcu73ogdnn6p7osz1cl3" },
    "בת חן": { fullName: "בת חן מצליח", id: "qkpkfxufqcul30tf6fa33634" },
    "גל": { fullName: "גל מישר-משאל", id: "ilqs8xqbd4p3fw95j9mbo09i" },
    "דניאלה": { fullName: "דניאלה סלמן", id: "lgvv2a7xy2aj7pvgx6edjzfh" },
    "דנית. ס": { fullName: "דנית סאלם", id: "mb29lb059espwxypsyxubds6" },
    "דנית פ": { fullName: "דנית פסח", id: "g8b4ebuf5kscba5z4jz5z9b5" },
    "דנית ש": { fullName: "דנית שינדלר", id: "pru3izahlvm8bdcx6fda9gdj" },
    "דנית.ש": { fullName: "דנית שינדלר", id: "pru3izahlvm8bdcx6fda9gdj" },
    "הילה": { fullName: "הילה זילברמן", id: "xd5ne40nuvih13cmtdj8mjz2" },
    "זיוה": { fullName: "זיוה אמיר", id: "timbxyuf4ka5pkga1i5guvsa" },
    "ליאור. ב": { fullName: "ליאור בועז", id: "o2r4d9it1pzxrevh3gglnjw4" },
    "ליאור.ב": { fullName: "ליאור בועז", id: "o2r4d9it1pzxrevh3gglnjw4" },
    "ליאור. י": { fullName: "ליאור יצחקוב", id: "vpj28uzuyhhqn0yqm0dp2e9u" },
    "ליאור.י": { fullName: "ליאור יצחקוב", id: "vpj28uzuyhhqn0yqm0dp2e9u" },
    "ליטל": { fullName: "ליטל פיירמן", id: "eiu0a93xkds66ygy9i2inxny" },
    "מאיה": { fullName: "מאיה הושיאר בלן", id: "q01c5bx4set9g780blfnv1ig" },
    "מורן": { fullName: "מורן בן ניסן", id: "wx4n6nlasqtgy8n86r4sohv7" },
    "מיכל מ": { fullName: "מיכל מעוז", id: "hiqfds7w09z59cwtb42s3h2b" },
    "מלי": { fullName: "מלי הולנדר", id: "lzdj0k1y4f8k1t6a0akvv3zx" },
    "מרצ'י": { fullName: "מרצ'י ספרנית", id: "c3hbzskrdr6dtplc9ijcxek1" },
    "נועה": { fullName: "נועה עשור בן לולו", id: "bum8fyo5a8gfdrcvlawudt5o" },
    "סדי": { fullName: "סדי זינגר", id: "vt1z8y0lk9tjj0tnwi13z9hf" },
    "עדי": { fullName: "עדי בן עמי", id: "b6kf6kbvj0kdc8k8vc90xoux" },
    "עידן": { fullName: "עידן שמעון", id: "d6u0nmy3gauujvi9mfqyx0y3" },
    "רותי": { fullName: "רותי וקנין", id: "v1a8lw6tenxhr81jwaxjiuda" },
    "רותם": { fullName: "רותם כהן", id: "ms66yihk4l3epc71n9c0nuog" },
    "רז": { fullName: "רז לוי", id: "hxomo1rdf1em8mpsytf0gdp9" },
    "רחלי": { fullName: "רחלי קציר", id: "ivo5gee8srkltvofvvazqh1w" },
    "שיר": { fullName: "שיר לוי", id: "vuzmvkxddy6xpelopz2tvd41" },
    "שירלי": { fullName: "שירלי דוידוב", id: "q1arba4oyhrxjovl1nhzax9w" },
    "שלומי": { fullName: "שלומי יהודה", id: "eaurolz4ko6n126m1cwbt030" },
    "שני. ב": { fullName: "שני בוכניק כהן", id: "mt791l0uc37cloyqyeqp44dx" },
    "שני.ב": { fullName: "שני בוכניק כהן", id: "mt791l0uc37cloyqyeqp44dx" },
    "שקד": { fullName: "שקד גבאי-נעמי", id: "byjqzr9k6oo9qnff1x28vzdd" },
    "תמר": { fullName: "תמר שוורץ", id: "bzpl6bt73tp0xpl8ar27mo9x" },
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
        title: "בוקר 7:45",
        rows: [
            ["מסדרון קומת כניסה", ["אורנה", "מורן", "איריס.ש", "דניאלה", "ליטל", "איריס.ש"]],
            ["מסדרון קומה ראשונה", ["סדי", "רחלי", "דנית פ", "הילה", "דנית פ", "אורנה"]],
            ["מסדרון קומה שנייה", ["אילנית", "מאיה", "זיוה", "זיוה", "הילה", "דנית ש"]],
        ],
    },
    {
        hour: 2,
        title: "הפסקה ראשונה",
        rows: [
            ["מסדרון קומת כניסה", ["אורנה", "מיכל מ", "דניאלה", "אודליה מ", "מרצ'י", "ליאור. י"]],
            ["מסדרון קומה ראשונה", ["תמר", "רותי", "אורטל", "הילה", "רותי", "מיכל מ"]],
            ["מסדרון קומה שנייה", ["אילנית", "שירלי", "מאיה", "מלי", "דנית.ש", "מלי"]],
            ["מתקנים + רחבה", ["גל", "רז", "שירלי", "אדן", "אלה", "שני. ב"]],
            ["מגרש כדורגל", ["עדי", "רותם", "שלומי", "שלומי", "בת חן", "דנית פ"]],
            ["מגרש אתלטיקה", ["ליאור. ב", "עידן", "סדי", "אורטל", "דנית. ס", "רחלי"]],
            ["חצר קדמית מתחם החלומות", ["שיר", "שקד", "מורן", "אסנת", "ליטל", "נועה"]],
        ],
    },
    {
        hour: 3,
        title: "הפסקה שנייה",
        rows: [
            ["מסדרון קומת כניסה", ["גל", "מורן", "דניאלה", "אודליה מ", "גל", null]],
            ["מסדרון קומה ראשונה", ["אלה", "דנית ש", "אודליה. מ", "תמר", "ליאור. י", null]],
            ["מסדרון קומה שנייה", ["אילנית", "שיר", "שני. ב", "שיר", "תמר", null]],
            ["מתקנים + רחבה", ["אדן", "מאיה", "ליאור.י", ["נועה", "אדן"], ["שני.ב", "רחלי"], null]],
            ["מגרש כדורגל", ["עדי", "רותם", ["בת חן", "עדי"], ["אלה", "רותם"], "בת חן", null]],
            ["מגרש אתלטיקה", ["ליאור. ב", "נועה", "אסנת", "רז", "שקד", null]],
            ["חצר קדמית מתחם החלומות", ["רז", "ליאור.ב", "שקד", "אסנת", "ליטל", null]],
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
    console.log(` ייבוא תורנויות - בית ספר יצחק נבון (מצב: ${isExecute ? "ביצוע ל-DB" : "סימולציה בלבד (Dry-Run)"} | מסד נתונים: ${isProd ? "PRODUCTION" : "STAGING"})`);
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

