export type SchoolType = {
    id: string;
    name: string;
    type: SchoolAgeGroup;
    status: SchoolStatus;
    createdAt: Date;
    updatedAt: Date;
}

export type SchoolStatus = "onboarding" | "active" | "archived";

export type SchoolAgeGroup = "Elementary" | "Middle" | "High";
