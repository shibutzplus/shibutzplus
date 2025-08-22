import { UserGender, UserRole } from "./auth";
import { SchoolLevel } from "./school";

export type FullUser = {
    email: string;
    name: string;
    gender: UserGender;
    role: UserRole;
    schoolName: string;
    level: SchoolLevel;
};
