/**
 * Script to import duty schedule (תורנויות) for school "שיא ראש העין" (school_id: cbvumdknjurdypbu8h956zt5)
 * Source PDF: ./תורנויות.pdf
 * 
 * Usage:
 *   npx tsx "Schedules/שיא ראש העין/import_guard.ts"             # Dry-run mode (prints preview only, NO DB changes)
 *   npx tsx "Schedules/שיא ראש העין/import_guard.ts" --execute   # Writes to database for the specified week
 */

import { loadEnv } from "../../src/db/load-env";
loadEnv();

import { createId } from "@paralleldrive/cuid2";

export const SCHOOL_ID = "cbvumdknjurdypbu8h956zt5"; // בית ספר "שיא"

// Dates starting from today: Tuesday 27/10/2026 through the cycle of weekdays
export const TARGET_DATES: Record<number, string> = {
    3: "2026-10-27", // יום שלישי (היום)
    4: "2026-10-28", // יום רביעי
    5: "2026-10-29", // יום חמישי
    6: "2026-10-30", // יום שישי
    1: "2026-11-01", // יום ראשון
    2: "2026-11-02", // יום שני
};

export const DAY_ORDER = [3, 4, 5, 6, 1, 2];

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
    "אורטל": { fullName: "אורטל הרשקוביץ", id: "evgcg27yv8ysud9tmm47fnuv" },
    "אינה": { fullName: "גולדמן אינה", id: "yoi6u2k298mppmw03cn03188" },
    "אלדמע": { fullName: "אלדמע פולק חנן", id: "dzbgxqv4fjeny7smijesaqlo" },
    "אנה": { fullName: "אנה זוסמנובסקי", id: "xg6qtjtzdvri9vj6bvp5f6lr" },
    "בר": { fullName: "בר שרף", id: "whziviwtx33f11ob6sro6jc3" },
    "גילה": { fullName: "גילה אשירוב ראובני", id: "pqj2kqjs85lio05ulavyjfwa" },
    "דנה ב": { fullName: "דנה ברק", id: "mqi3vqkgjndcbx9p83hy8zw7" },
    "דנה ק": { fullName: "דנה קרלין", id: "n1i6ryrlichs1ydq6jsb472q" },
    "ורד": { fullName: "ורד ברק", id: "y2uv33qjgkkp9qwucprv2l1k" },
    "חן": { fullName: "חן חכם", id: "neub80ns8ur8pz4ybzopkvyh" },
    "ליאונור": { fullName: "ליאונור ימין", id: "npoy1gq4ia84nx9dvdtgvc7w" },
    "ליאת": { fullName: "ליאת עמר", id: "kpkhwotazs5048uswbomux4u" },
    "לידר": { fullName: "לידר קשטן", id: "gov67obtqlji0c6qikrakwt5" },
    "ליז": { fullName: "ליז פוקשנסקי פיינשטיין", id: "nr40btkr4tu7vrw6pmfirbj5" },
    "ליטל": { fullName: "ליטל צפדיה", id: "zrb6hj5tbjhjcxeqw3ry9p3x" },
    "ליליה": { fullName: "ליליה שישליאניקוב", id: "ralkmg81k9yrtua80litiazl" },
    "לירון": { fullName: "לירון שרגורודסקי", id: "tkerfhe98orrvt94k5xom2lu" },
    "לירז": { fullName: "לירז שחר", id: "qe7x1csb9eekjf9rverlp8jk" },
    "מזי": { fullName: "מזי ניסני", id: "p01mxsvw31tu4a7ur6gkndke" },
    "מחמוד": { fullName: "מחמוד עאזם", id: "w0237yxj6pc6xu4slubbsqwa" },
    "מיטל": { fullName: "מיטל יריב", id: "bjg9j497ntino1bggaxjqekm" },
    "מיכל": { fullName: "מיכל ביטון", id: "dqymb9o56obb2546e44b1t3h" },
    "מימי": { fullName: "מימי פרץ", id: "vznbd2w3cuonbfrembnsj58f" },
    "מירי": { fullName: "מירי רבינוביץ", id: "k7adzm6ikh5ici88dfp7t766" },
    "מרח": { fullName: "מרח מסראוה", id: "fsjkz199suw0fmjpze834vde" },
    "נועה": { fullName: "נועה מאיר", id: "gbhzlzkfrzyzp940kmb531uv" },
    "סיגל": { fullName: "סיגל וויט", id: "omrzb9lnrh68f18z65itedff" },
    "סימה": { fullName: "סימה ישועה", id: "aod3ha35c5a9p21y4h8ueoek" },
    "ספיר": { fullName: "ספיר פרץ", id: "yz08aikir0bpl6olntt5bjdz" },
    "סתיו": { fullName: "סתיו גמליאל", id: "gy6663f8p7pgwu3n8q3zs72n" },
    "עדי": { fullName: "עדי ינאי", id: "hf2mg34o66erlrmxnj9v6cbx" },
    "עדן": { fullName: "עדן זכריה", id: "p2zxfospt7ird5lvrre3ga4c" },
    "עוז": { fullName: "עוז שחר אלבז", id: "lb5gnmds7yedwotz7cmd9doy" },
    "עינב": { fullName: "עינב מידז׳נסקי איפרגן", id: "i5oyirfr419jkb3pixoux2ju" },
    "עמית": { fullName: "עמית אלוני", id: "ndxon4b5bk4gkft0qz4ep6pf" },
    "קטיה": { fullName: "קטיה חריטון איסטנר", id: "d804rb8yj7m458rdjmv00wae" },
    "שירין": { fullName: "שירין אבו סנינה", id: "ka7d91hdy31gmye2vtqh1w07" },
    "שירן": { fullName: "שירן שונשיין", id: "oby00az8ai89l60hemhoak07" },
    "שלי": { fullName: "שלי חסון", id: "l7vayyjtodtax9pegj0fmqk0" },
    "שני": { fullName: "שני ידאעי", id: "jw5slfz2aroylfqcfx4kmgsb" },
    "שרון": { fullName: "שרון סיני", id: "p50v6souqjkhn5jfgvpl2kbu" },
    "תמי": { fullName: "תמי לרנר", id: "zah99ww7e2105jjdohbvtpng" },
    "תמר": { fullName: "תמר קליין", id: "uiti0ibu76421cohigp8a2pf" },
    "תקווה": { fullName: "תקווה גטה", id: "xoxn45b9bef2bqtu3ztk4qzn" },
};

export interface DutyAssignment {
    location: string;
    teacherShort: string;
}

export interface ShiftDefinition {
    hour: number;
    title: string;
    // Row definitions: [location, [Sun, Mon, Tue, Wed, Thu, Fri]]
    rows: [string, (string | null)[]][];
}

export const SHIFTS: ShiftDefinition[] = [
    {
        hour: 1,
        title: "תורנות בוקר 7:35-8:00",
        rows: [
            ["שער כניסה", ["אינה", "אינה", "אינה", "אינה", "שירין", "אינה"]],
            ["קומה 1", ["אלדמע", "מיכל", "מיכל", "אלדמע", "אלדמע", "מיכל"]],
            ["קומה 2", ["סיגל", "מזי", "ליליה", "תמר", "מימי", "תקווה"]],
            ["קומה 3", ["תקווה", "דנה ב", "דנה ק", "עינב", "ליליה", "לידר"]],
            ["חצר", ["דנה ק", "ורד", "שירין", "עדן", "מזי", "דנה ק"]],
        ],
    },
    {
        hour: 2,
        title: "הפסקה 1א (9:35-9:55)",
        rows: [
            ["גינה לימודית", ["ליז", "סימה", "מזי", "בר", "ליז", "עוז"]],
            ["דשא סינטטי", ["עוז", "אורטל", "מימי", "מירי", "שלי", "מרח"]],
            ["מתקן", ["מירי", "חן", "שרון", "מרח", "עדי", "אורטל"]],
            ["מגרש", ["שרון", "מחמוד", "עדן", "מחמוד", "עוז", "שירן"]],
            ["פטרול קומה 2", ["עדי", "ספיר", "ספיר", "לידר", "לירז", "ליליה"]],
            ["פטרול קומה 3", ["בר", "לירז", "דנה ב", "ליאונור", "עינב", "ליאונור"]],
        ],
    },
    {
        hour: 3,
        title: "הפסקה 1ב (9:55-10:15)",
        rows: [
            ["גינה לימודית", ["סתיו", "לירון", "לירון", "סיגל", "מירי", "קטיה"]],
            ["דשא סינטטי", ["תמי", "שני", "אנה", "ורד", "סיגל", "אלדמע"]],
            ["מתקן", ["נועה", "ליטל", "תמי", "שני", "קטיה", "גילה"]],
            ["מגרש", ["ליאת", "גילה", "עמית", "עמית", "עמית", "ורד"]],
            ["פטרול קומה 1", ["גילה", "נועה", "מיכל", "סתיו", "ליטל", "מיטל"]],
        ],
    },
    {
        hour: 4,
        title: "הפסקה 2 (11:45-12:15)",
        rows: [
            ["גינה לימודית", ["שירן", "ליאונור", "סתיו", "לירון", "אורטל", null]],
            ["דשא סינטטי", ["שלי", "עינב", "שני", "עדי", "תמי", null]],
            ["מגרש", ["קטיה", "תקווה", "סימה", "שירן", "מחמוד", null]],
            ["קומה 1", ["ספיר", "עדן", "בר", "סימה", "אנה", null]],
            ["פטרול קומה 2+3", ["לירז", "לידר", "ליז", "דנה ב", "תמר", null]],
            ["מתקן", ["ליטל", "תמר", "שלי", "שרון", "מיטל", null]],
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
    console.log(` ייבוא תורנויות - בית ספר שיא (מצב: ${isExecute ? "ביצוע ל-DB" : "סימולציה בלבד (Dry-Run)"} | מסד נתונים: ${isProd ? "PRODUCTION" : "STAGING"})`);
    console.log("==================================================================\n");

    // Dynamic import DB only if needed
    let db: any, schema: any, executeQuery: any;
    if (isExecute) {
        const dbModule = await import("../../src/db");
        db = dbModule.db;
        schema = dbModule.schema;
        executeQuery = dbModule.executeQuery;
    }

    // Process days in order starting from today
    for (const day of DAY_ORDER) {
        const dateStr = TARGET_DATES[day];
        const dayName = DAY_NAMES[day];
        // Generate non-recurring column ID (standard cuid)
        const columnId = createId();

        console.log(`\n-------------------------------------------------------------`);
        console.log(` ${dayName} (${dateStr}) | Column ID: ${columnId}`);
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
            position: 2000,
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
                const teacherShort = daysList[day - 1];
                if (!teacherShort) continue;

                const mapped = TEACHER_MAP[teacherShort];
                if (!mapped) {
                    throw new Error(`Teacher '${teacherShort}' not found in TEACHER_MAP!`);
                }

                shiftTeachers.push(mapped.id);
                instructionsMap[mapped.id] = location;
            }

            if (shiftTeachers.length === 0) continue; // E.g., Friday shift 4

            rowsToInsert.push({
                id: createId(),
                schoolId: SCHOOL_ID,
                date: dateStr,
                day: day,
                hour: shift.hour,
                columnId: columnId,
                position: 2000,
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
