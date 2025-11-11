// TODO: to remove this page

import { EventColor, ExistingTeacherColor, MissingTeacherColor } from "./colors";

export const DailyTableColors = {
    missingTeacher: {
        borderLeft: "10px solid #ae2b27af",
        color: "#606060",
        headerColor: "#F8EFEF",
    },
    existingTeacher: {
        borderLeft: "10px solid #2e6e94",
        color: "#606060",
        headerColor: "#EDF4F8",
    },
    event: {
        borderLeft: "10px solid #27ae60",
        color: "#606060",
        headerColor: "#F7FBF5",
    },
    publish: {
        borderLeft: "10px solid #8a2be2",
        color: "#606060",
    },
};

export const COLOR_BY_TYPE = {
    missingTeacher: MissingTeacherColor,
    existingTeacher: ExistingTeacherColor,
    event: EventColor,
} as const;