export const HeaderColor = "#fffbf5";
export const HourHeaderColor = "#fffbf5";
export const HourRowColor = "#fffbf5";

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
        headerColor: "#F8EFEF",
    },
    existingTeacher: {
        borderLeft: "4px solid #2e6e94",
        color: "#606060",
        headerColor: "#EDF4F8",
    },
    event: {
        borderLeft: "4px solid #27ae60",
        color: "#606060",
        headerColor: "#F7FBF5",
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