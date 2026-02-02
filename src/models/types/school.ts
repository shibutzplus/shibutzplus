import { ActionResponse } from "./actions";
import { SchoolSettingsType } from "./settings";
import { SCHOOL_LEVEL, SCHOOL_STATUS } from "../constant/school";

export type SchoolStatus = typeof SCHOOL_STATUS[keyof typeof SCHOOL_STATUS];

export type SchoolLevel = typeof SCHOOL_LEVEL[keyof typeof SCHOOL_LEVEL];

export type SchoolType = {
    id: string;
    name: string;
    type: SchoolLevel;
    status: SchoolStatus;
    publishDates: string[];
    createdAt: Date;
    updatedAt: Date;
    hoursNum: number;
    displaySchedule2Susb: boolean;
    settings?: SchoolSettingsType;
};

export type GetSchoolResponse = ActionResponse & {
    data?: SchoolType;
};
