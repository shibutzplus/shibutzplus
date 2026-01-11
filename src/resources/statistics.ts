import { StatisticTypeValues } from "@/models/types/statistics";
import { SCHOOL_MONTHS } from "@/utils/time";

export const STATISTICS_OPTIONS = [
    { value: StatisticTypeValues.months, label: "היעדרות לפי חודשים" },
    { value: StatisticTypeValues.teachers, label: "היעדרויות לפי מורים" },
    { value: StatisticTypeValues.days, label: "היעדרויות לפי ימי השבוע" },
];

export const STATISTICS_SHORT_OPTIONS = [
    { value: StatisticTypeValues.months, label: "לפי חודש" },
    { value: StatisticTypeValues.teachers, label: "לפי מורה" },
    { value: StatisticTypeValues.days, label: "לפי ימים" },
];

export const STATISTICS_MONTH_OPTIONS = [
    { value: "all", label: "כל השנה" },
    ...SCHOOL_MONTHS.map((month) => ({ value: month, label: month })),
];

export const STATISTICS_MOBILE_MONTH_OPTIONS = [
    { value: "all", label: "הכל" },
    ...SCHOOL_MONTHS.map((m) => {
        const index = SCHOOL_MONTHS.indexOf(m);
        // SCHOOL_MONTHS starts at September (idx 0 -> 09)
        // 0(Sept)->9, 1(Oct)->10, ..., 3(Dec)->12, 4(Jan)->1
        const monthNum = ((index + 8) % 12) + 1;
        return {
            value: m,
            label: monthNum.toString().padStart(2, "0"),
        };
    }),
];
