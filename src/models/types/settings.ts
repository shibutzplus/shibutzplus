import { ActionResponse } from "./actions";

export type SchoolSettingsType = {
    id: number;
    fromHour: number;
    toHour: number;
    displaySchedule2Susb: boolean;
    schoolId: string;
};

export type GetSchoolSettingsResponse = ActionResponse & {
    data?: SchoolSettingsType;
};
