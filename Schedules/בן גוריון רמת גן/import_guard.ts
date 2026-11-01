/**
 * Script to import duty schedule (תורנויות) for school "בן גוריון רמת גן" (school_id: gp651ekzhub38ib6tfgid4tg)
 * Source PDF: ./לוח תורנויות.pdf
 * 
 * Usage:
 *   npx tsx "Schedules/בן גוריון רמת גן/import_guard.ts"             # Dry-run mode (prints preview only, NO DB changes)
 *   npx tsx "Schedules/בן גוריון רמת גן/import_guard.ts" --execute   # Writes to database for the specified week
 */

import { loadEnv } from "../../src/db/load-env";
loadEnv();

import { createId } from "@paralleldrive/cuid2";

export const SCHOOL_ID = "gp651ekzhub38ib6tfgid4tg"; // בית ספר "בן גוריון"

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
 * Mapping of names in PDF to exact full name and ID in database
 */
export const TEACHER_MAP: Record<string, { fullName: string; id: string }> = {
    "אופירה בן ציון": { fullName: "אופירה בן ציון", id: "xwdizaqbb2h3q2p0o0fqozie" },
    "אורלי וינקלר": { fullName: "אורלי וינקלר", id: "ih06jpf8k1btb87popjn2aks" },
    "אורן בן יוסף": { fullName: "אורן בן יוסף", id: "y6dwcrff5pkhp4u6rf5ayc0g" },
    "אילנית שמש": { fullName: "אילנית שמש", id: "k87yi09n2ttuk335u7l8smbv" },
    "אלה שאולוב": { fullName: "אלה שאולוב", id: "cfciic39jogg3329jwpfmg2c" },
    "אפרת ברינבוים": { fullName: "אפרת", id: "nh9qcc1xav0wec3i5kezmpao" },
    "בילי כהן": { fullName: "בילי כהן", id: "d3u08sxxa5xeyxeoosmnj2k8" },
    "בת-אל דודקביץ": { fullName: "בת אל דודקביץ", id: "wfjv3j3a61ye6a04kalfe08s" },
    "גילה ויצבליט": { fullName: "גילה ויצבליט", id: "vfyumtqnqsrgql7e4r4fbqy9" },
    "גל חיים שפילמן": { fullName: "גל חיים שפילמן", id: "vx5yt40zumdjrpm8w77hu3e0" },
    "גל חיים פישמן": { fullName: "גל חיים שפילמן", id: "vx5yt40zumdjrpm8w77hu3e0" },
    "גלי וייס": { fullName: "גלי ויסמן", id: "tqnlwrokmce0l8cg5spbi577" },
    "דבי גל-און": { fullName: "דבי גל-און", id: "u89nsrvvvo84ndj4i93zkvpu" },
    "דנה גרוספלד": { fullName: "דנה גרוספלד", id: "x8w4ytz4uorxgpmn2infv8du" },
    "דניאל פלח": { fullName: "דניאל פלח", id: "gi55ks858rtj0nyi1zkwzqio" },
    "הילה לוי": { fullName: "הילה לוי מתי\"א", id: "zibclaotfslt9zgkyi4z05vz" },
    "ויקטוריה גורדון": { fullName: "ויקטוריה גורדון", id: "mzrjzmubegyn79cq9qzzm1vv" },
    "טלי הלוי": { fullName: "טלי הלוי", id: "nof7tjyld32nbps98br9w4ku" },
    "יגאל מרכוס": { fullName: "יגאל מרקוס", id: "dlyludyplnnsg9huw4rvqg99" },
    "יונתן נבון": { fullName: "יונתן נבון", id: "k9msz3y2pt0y7s3mclaqjmnn" },
    "יעל מנור בכר": { fullName: "יעל מנור בכר", id: "oc5hyqzifzh1k2pp12hjhfkz" },
    "לאה ארונס": { fullName: "לאה ארונס", id: "l4el49jcal3rh1eq1b3dbu7d" },
    "לורה שופוב": { fullName: "לורה שופוב", id: "kyu5awp0fmsazamc4vnvvl4w" },
    "ליאור כהן": { fullName: "ליאור כהן", id: "tzpgk0xza3bcv09llm72yo20" },
    "מורן פיומי": { fullName: "מורן פיומי", id: "vo6upby3liwrt94ju7hugxkc" },
    "מיכל מדמון": { fullName: "מיכל מדמון", id: "ak75ii8ikspw0vtrfnswt9ge" },
    "מיכל רובין": { fullName: "מיכל רובין", id: "bta9wm4bocc9s36orhrihixc" },
    "מיכל שושטרי": { fullName: "מיכל שושטרי", id: "v3jz7r8jvk4rqrz6y2m3hc2q" },
    "נטע בר חיים": { fullName: "נטע בר חיים", id: "hq5slvvladase6bguuh3v5px" },
    "נטע לי מטלון": { fullName: "נטע לי מטלון", id: "jii2qkmgyonn6sfzigmqhtfo" },
    "סהר שפירא": { fullName: "סהר שפירא", id: "ffbngob9xi97sobehkebdm1x" },
    "סופי חן": { fullName: "סופי חן", id: "yp20ozez9566r00lt1okftxe" },
    "סיגלית זלכה": { fullName: "סיגלית זילכה", id: "cql303y9fcijml9nnqpadqh4" },
    "עדה שטרסברג": { fullName: "עדה שטרסברג", id: "nqkeflkqp5duv3934t1tk0nv" },
    "עדי ברל": { fullName: "עדי ברל", id: "wjjm5zk0128ekoazrf8h9ul1" },
    "עירית אנגלר": { fullName: "עירית אנגלר", id: "qy0opkx0frj03h4rx60io1kz" },
    "עיריית אנגלר": { fullName: "עירית אנגלר", id: "qy0opkx0frj03h4rx60io1kz" },
    "ענבל דן": { fullName: "ענבל דן", id: "evbmfb9yjksojgm02pw0q0e7" },
    "רונית עזרא": { fullName: "רונית עזרא", id: "ahthx5mdyr84owus3hxoh8ib" },
    "רונית אזרע": { fullName: "רונית עזרא", id: "ahthx5mdyr84owus3hxoh8ib" },
    "ריקי חתוקה": { fullName: "ריקי חתוקה", id: "v8vxpt7325qdr4vivb2lrhvz" },
    "שגית שניר": { fullName: "שגית שניר", id: "k0qs2c753s8ahtq84200q9x7" },
    "שנית יהודיין": { fullName: "שנית יהודיין", id: "br73wxh0799gnyfaln6z6eu0" },
    "שרון ברלב": { fullName: "שרון ברלב", id: "e04w2tg2yhwqowq79c77jy6m" },
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
        title: "תורנות בוקר (7:50)",
        rows: [
            ["שער כניסה", ["טלי הלוי", "ענבל דן", "סיגלית זלכה", "ענבל דן", "אלה שאולוב", "מורן פיומי"]],
        ],
    },
    {
        hour: 3,
        title: "הפסקה גדולה (9:50-10:10)",
        rows: [
            ["מגרש", ["אילנית שמש", "ריקי חתוקה", "אורן בן יוסף", "יגאל מרכוס", "אלה שאולוב", "מורן פיומי"]],
            ["מגרש עיגולים", ["שרון ברלב", "יונתן נבון", "עדי ברל", "ליאור כהן", "גלי וייס", "מיכל שושטרי"]],
            ["מדעים עליון", ["טלי הלוי", "נטע בר חיים", "דניאל פלח", "אפרת ברינבוים", "נטע לי מטלון", "בילי כהן"]],
            ["מגדל", ["יעל מנור בכר", "סהר שפירא", "הילה לוי", "אורלי וינקלר", "גל חיים שפילמן", "דנה גרוספלד"]],
            ["חצר קדמית", ["ויקטוריה גורדון", "מיכל רובין", "סופי חן", "מיכל מדמון", "בת-אל דודקביץ", "לאה ארונס"]],
            ["מסדרון כניסה קומה א", ["לורה שופוב", "מיכל רובין", "מיכל שושטרי", "מיכל מדמון", "שנית יהודיין", "עירית אנגלר"]],
            ["מסדרון כניסה קומה ב", ["גילה ויצבליט", "דבי גל-און", "אופירה בן ציון", "עדה שטרסברג", "בילי כהן", "שגית שניר"]],
        ],
    },
    {
        hour: 4,
        title: "הפסקה קצרה (11:45-12:00)",
        rows: [
            ["מגרש", ["אילנית שמש", "ריקי חתוקה", "אורן בן יוסף", "יגאל מרכוס", "שנית יהודיין", null]],
            ["מגרש עיגולים", ["שרון ברלב", "יונתן נבון", "עדי ברל", "ליאור כהן", "גלי וייס", null]],
            ["מדעים עליון", ["עדה שטרסברג", "נטע בר חיים", "דניאל פלח", "אפרת ברינבוים", "נטע לי מטלון", null]],
            ["מגדל", ["יעל מנור בכר", "רונית עזרא", "הילה לוי", "אורלי וינקלר", "רונית אזרע", null]],
            ["חצר קדמית", ["ויקטוריה גורדון", "מיכל רובין", "סופי חן", "מיכל מדמון", "גל חיים פישמן", null]],
            ["מסדרון כניסה קומה א", ["לורה שופוב", "מיכל רובין", "מיכל שושטרי", "לאה ארונס", "שנית יהודיין", null]],
            ["מסדרון כניסה קומה ב", ["גילה ויצבליט", "דבי גל-און", "אופירה בן ציון", "שגית שניר", "עיריית אנגלר", null]],
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
    console.log(` ייבוא תורנויות - בית ספר בן גוריון (מצב: ${isExecute ? "ביצוע ל-DB" : "סימולציה בלבד (Dry-Run)"} | מסד נתונים: ${isProd ? "PRODUCTION" : "STAGING"})`);
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

