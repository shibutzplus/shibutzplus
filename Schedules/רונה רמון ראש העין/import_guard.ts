/**
 * Script to import duty schedule (תורנויות) for school "רונה רמון ראש העין" (school_id: kbv3hdt2el52ws1zytijrpyz)
 * Source PDF: ./לוח תורנויות.pdf
 *
 * Usage:
 *   npx tsx "Schedules/רונה רמון ראש העין/import_guard.ts"             # Dry-run mode (prints preview only, NO DB changes)
 *   npx tsx "Schedules/רונה רמון ראש העין/import_guard.ts" --execute   # Writes to database for the specified week
 */

import { loadEnv } from "../../src/db/load-env";
loadEnv();

import { createId } from "@paralleldrive/cuid2";

export const SCHOOL_ID = "kbv3hdt2el52ws1zytijrpyz"; // בית ספר "רונה רמון" ראש העין

// Dates for the current week: Sunday 01/11/2026 through Friday 06/11/2026
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
 * Mapping of short / table names in PDF to exact full name and ID in database
 */
export const TEACHER_MAP: Record<string, { fullName: string; id: string }> = {
    "אבי": { fullName: "אבי", id: "znnlyn4h1whqufqfh0f5puu0" },
    "אוסנת": { fullName: "אוסנת דעבול", id: "mqz08zdw1r5l2xpiipl7y42k" },
    "אורטל": { fullName: "אורטל גדסי", id: "ljjsl5a02icyblo5cwnt6jdf" },
    "אורלי": { fullName: "אורלי דוד", id: "v8kbdo1ejjrfjpgimmjsv3u1" },
    "איילת": { fullName: "איילת שתיל", id: "j2novkx9xvvjk91nj2idzvon" },
    "איילת שתיל": { fullName: "איילת שתיל", id: "j2novkx9xvvjk91nj2idzvon" },
    "אנני": { fullName: "אנני עצמון", id: "exfd70wu3gwirkk5cgdo3c7i" },
    "בתיה": { fullName: "בתיה אלזס", id: "s5fbuk6tz32e1e5s6lt7r58s" },
    "דבורה": { fullName: "דבורה מושקיביץ", id: "m3ppputgdzgo6yjhhq0pxdgf" },
    "דגנית": { fullName: "דגנית לוי", id: "ef64e6oz2y82pyhp8eb3jejc" },
    "הדס זילברשטיין": { fullName: "הדס זילברשטיין", id: "gfuyzaeyc5mboem4svrsiyu6" },
    "הדס פרץ": { fullName: "הדס פרץ", id: "sjkqz36ilek7e659fprql5or" },
    "הדס ציפור": { fullName: "ציפור הדס", id: "ug22dqxysuoqj44wnfu9d7wj" },
    "הילה לויאן": { fullName: "הילה ליויאן", id: "yexqgdvmqtmt7bujbxyepq7d" },
    "טלי": { fullName: "טלי חתוכה", id: "ooezzarf3q37jgbnpryw0bfm" },
    "יפית": { fullName: "יפית לייפרמן", id: "y4avfbo2c0c9pcx4kohr2ad1" },
    "ליאת": { fullName: "ליאת ששון", id: "xfcf27rk8iq6i83ji2licqvb" },
    "לימור": { fullName: "לימור לשם", id: "kxvpxqiu61gcpedtuk8bovos" },
    "מאיה": { fullName: "מאיה דקל", id: "fwpg0m1fog9sgacsnrq8l6e3" },
    "מור": { fullName: "מור שאנן", id: "rcyhesh79pzejyq75o7uwk35" },
    "מיכל": { fullName: "מיכל עוגן", id: "raymj1l4065j7gtvzib8yo7o" },
    "מירב": { fullName: "מירב בארי", id: "q6jj3fhtu3poiz92n6621g2u" },
    "מראם": { fullName: "מראם קאסם", id: "kjaoajvsywskk4q7k4s6ect1" },
    "מרינה": { fullName: "מרינה פרימקוב", id: "el3c9egnby2e2s5dxzayrdy1" },
    "סאלי": { fullName: "סאלי נאסר", id: "xwysu2fh68bce3wya0igg4f0" },
    "סוהילה": { fullName: "סוהיילה מסארוה", id: "eh187s0ejrp5jqudi9tfomb3" },
    "פאטמה": { fullName: "פאטמה יאסין", id: "e19auke53y7ofsmvqrk8vxky" },
    "צופית": { fullName: "צופית אחרק", id: "ilrfsiajnpqdmpelsyh0why4" },
    "ציפי": { fullName: "ציפי שטרן", id: "jx6dr2me8kebob1zts1jsirw" },
    "קטי": { fullName: "קטי אורפלי", id: "uq16fd03s7da8l0p8g9nbfas" },
    "קרן": { fullName: "קרן ראובן", id: "a453u1kj51wn5l3fz2gvwbzf" },
    "רותם": { fullName: "רותם אוזן", id: "cgzxprtxiwd2d1dl29ljveun" },
    "רחלי וידס": { fullName: "רחלי וידס", id: "lc2c1t44mz64nw7g7069l0vf" },
    "רחלי מרחבי": { fullName: "רחלי מרחבי", id: "v64erl55ndb0tkyc30e4v7yq" },
    "רעות": { fullName: "רעות שחר", id: "gwo44sy4ipeyh6ft0ks3fiwg" },
    "רקפת": { fullName: "רקפת רויז", id: "ttlxtdrev4lcem0deb1vgy6s" },
    "שובל": { fullName: "שובל אלימלח", id: "h0mea25vo7h5shl194gprlc4" },
    "שחר": { fullName: "שחר קצב", id: "cwtpjnjnvnsaaac76xi3szjd" },
    "שירה יהודית": { fullName: "יהודית שירה ימיני", id: "vw7970vrmw5goinieilvhz4z" },
    "שרון ברקמן": { fullName: "שרון ברקמן", id: "hqi3xi01w7uecelbygm48aoz" },
    "שרון חדד": { fullName: "שרון חדד", id: "jdblgaq1te6ntym0bkcgkd7m" },
    "שרון נהרי": { fullName: "נהרי שרון", id: "k2h2jmjaz7790gkt0sv5523l" },
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
        title: "בוקר (7:45-8:00)",
        rows: [
            ["שער", ["דגנית", "דגנית", "דגנית", "דגנית", "ליאת", "דגנית"]],
            ["מרחב א'-ב'", ["אנני", "לימור", "רותם", "יפית", "רותם", "איילת"]],
            ["מרחב ג'-ד'", ["ליאת", "ליאת", "אורלי", "שרון חדד", "קטי", "ליאת"]],
            ["מרחב ה'-ו'", ["רחלי וידס", "יפית", "ליאת", "אורלי", "רחלי וידס", "מאיה"]],
        ],
    },
    {
        hour: 2,
        title: "הפסקה בוגרים (9:35-9:55)",
        rows: [
            ["מרחב ד'", ["קרן", "אנני", "שרון חדד", "שרון חדד", "מור", "אורטל"]],
            ["מרחב ה'", ["צופית", "צופית", "יפית", "מראם", "מראם", "מאיה"]],
            ["מרחב ו'", ["הילה לויאן", "מרינה", "סוהילה", "פאטמה", "ציפי", "קטי"]],
            ["ח. קדמית", ["שובל", "איילת", "הדס ציפור", "הדס ציפור", "אנני", "אוסנת"]],
            ["ח. אחורית", ["מור", "שובל", "פאטמה", "ציפי", "מרינה", "הילה לויאן"]],
            ["מגרש", ["רחלי מרחבי", "רחלי וידס", "ליאת", "אורטל", null, "הדס זילברשטיין"]],
        ],
    },
    {
        hour: 3,
        title: "הפסקה צעירים (9:55-10:15)",
        rows: [
            ["מרחב א'", ["לימור", "הדס פרץ", "מאיה", "טלי", "טלי", "בתיה"]],
            ["מרחב ב'", ["רותם", "מיכל", "שרון נהרי", "דבורה", "דבורה", "שרון ברקמן"]],
            ["מרחב ג'", ["אוסנת", "שירה יהודית", "אורלי", "שחר", "סאלי", "איילת שתיל"]],
            ["ח. קדמית", ["סאלי", "רעות", "הדס זילברשטיין", "שירה יהודית", "רקפת", "שרון נהרי"]],
            ["ח. אחורית", ["שרון ברקמן", "אבי", "רחלי מרחבי", "הדס פרץ", "מיכל", "דבורה"]],
            ["מגרש", ["שחר", "מירב", "בתיה", "רעות", null, "מירב"]],
        ],
    },
    {
        hour: 4,
        title: "הפסקה משותפת (11:45-12:00)",
        rows: [
            ["מרחב א'", ["טלי", "בתיה", "מירב", "לימור", "אבי", null]],
            ["מרחב ב'", ["מיכל", "אוסנת", "הדס פרץ", "שרון ברקמן", "מירב", null]],
            ["מרחב ג'", ["רחלי מרחבי", "הדס ציפור", "רעות", "סאלי", "איילת", null]],
            ["מרחב ד'", ["אורטל", "שחר", "מור", "קרן", "אנני", null]],
            ["מרחב ה'", ["אורלי", "רקפת", "צופית", "יפית", "הילה לויאן", null]],
            ["מרחב ו'", ["פאטמה", "מור", "קטי", "רחלי וידס", "שובל", null]],
            ["ח. קדמית", ["מאיה", "ציפי", "דבורה", "רותם", "קטי", null]],
            ["ח. אחורית", ["סוהילה", "מראם", "שירה יהודית", "שרון נהרי", "מרינה", null]],
            ["מגרש", ["שרון חדד", "מרינה", "פאטמה", "סאלי", null, null]],
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
    console.log(` ייבוא תורנויות - בית ספר רונה רמון ראש העין (מצב: ${isExecute ? "ביצוע ל-DB" : "סימולציה בלבד (Dry-Run)"} | מסד נתונים: ${isProd ? "PRODUCTION" : "STAGING"})`);
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

                    if (!shiftTeachers.includes(mapped.id)) {
                        shiftTeachers.push(mapped.id);
                    }
                    instructionsMap[mapped.id] = instructionsMap[mapped.id]
                        ? `${instructionsMap[mapped.id]}, ${location}`
                        : location;
                }
            }

            if (shiftTeachers.length === 0) continue; // E.g., Friday shift 4

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

