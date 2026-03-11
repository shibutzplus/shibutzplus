import { ReportTypeValues } from "@/models/types/reports";
import { SCHOOL_MONTHS } from "@/utils/time";

export const REPORTS_OPTIONS = [
    { value: ReportTypeValues.months, label: "היעדרות לפי חודשים" },
    { value: ReportTypeValues.teachers, label: "היעדרויות לפי מורים" },
    { value: ReportTypeValues.days, label: "היעדרויות לפי ימי השבוע" },
];

export const REPORTS_SHORT_OPTIONS = [
    { value: ReportTypeValues.months, label: "לפי חודש" },
    { value: ReportTypeValues.teachers, label: "לפי מורה" },
    { value: ReportTypeValues.days, label: "לפי ימים" },
];

export const REPORTS_MONTH_OPTIONS = [
    { value: "all", label: "כל השנה" },
    ...SCHOOL_MONTHS.map((month) => ({ value: month, label: month })),
];

export const REPORTS_MOBILE_MONTH_OPTIONS = [
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
