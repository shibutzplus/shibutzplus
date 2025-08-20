import { UserGender, UserRole } from "./auth";

export type SchoolLevel = "elementary" | "middle" | "high";

export type FullUser = {
    name: string;
    gender: UserGender;
    role: UserRole;
    schoolName: string;
    level: SchoolLevel;
};
