import { ActionResponse } from "./actions";

export type SchoolStatus = "onboarding" | "active" | "archived";

export type SchoolAgeGroup = "Elementary" | "Middle" | "High";

export type SchoolType = {
    id: string;
    name: string;
    type: SchoolAgeGroup;
    status: SchoolStatus;
    publishDates: string[];
    createdAt: Date;
    updatedAt: Date;
};

export type GetSchoolResponse = ActionResponse & {
    data?: SchoolType;
};