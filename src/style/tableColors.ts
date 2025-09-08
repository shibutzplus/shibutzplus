export const HeaderColor = "#f7faff";
export const HourRowColor = "#f7faff";

export const AnnualTableColors = [
    HeaderColor,
    HeaderColor,
    HeaderColor,
    HeaderColor,
    HeaderColor,
    HeaderColor,
];

export const DailyTableColors = {
    missingTeacher: {
        borderLeft: "4px solid #ae2b27af",
        color: "#606060",
        headerColor: "#af3c3815",
    },
    existingTeacher: {
        borderLeft: "4px solid #2e6e94",
        color: "#606060",
        headerColor: "#3883af17",
    },
    event: {
        borderLeft: "4px solid #27ae60",
        color: "#606060",
        headerColor: "#64af380d",
    },
    publish: {
        borderLeft: "4px solid #8a2be2",
        color: "#606060",
    },
};

export const COLOR_BY_TYPE = {
    missingTeacher: DailyTableColors.missingTeacher.headerColor,
    existingTeacher: DailyTableColors.existingTeacher.headerColor,
    event: DailyTableColors.event.headerColor,
} as const;