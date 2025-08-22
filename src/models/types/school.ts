import { ActionResponse } from "./actions";

export type SchoolStatus =
    | "onboarding"
    | "onboarding-annual"
    | "annual"
    | "onboarding-daily"
    | "daily";

export type SchoolLevel = "Elementary" | "Middle" | "High";

export type SchoolType = {
    id: string;
    name: string;
    type: SchoolLevel;
    status: SchoolStatus;
    publishDates: string[];
    createdAt: Date;
    updatedAt: Date;
};

export type GetSchoolResponse = ActionResponse & {
    data?: SchoolType;
};
