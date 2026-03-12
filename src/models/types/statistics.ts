export const StatisticsTypeValues = {
    months: "months" as const,
    teachers: "teachers" as const,
    days: "days" as const,
};

export type StatisticsType = keyof typeof StatisticsTypeValues;
