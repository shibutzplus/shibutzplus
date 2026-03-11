export const ReportTypeValues = {
    months: "months" as const,
    teachers: "teachers" as const,
    days: "days" as const,
};

export type ReportType = keyof typeof ReportTypeValues;
