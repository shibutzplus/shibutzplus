export const StatisticTypeValues = {
    months: "months" as const,
    teachers: "teachers" as const,
    days: "days" as const,
};

export type StatisticType = keyof typeof StatisticTypeValues;
