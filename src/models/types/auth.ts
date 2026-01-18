// Extend the next-auth types
import "next-auth";
import { ActionResponse } from "./actions";
import { SchoolLevel } from "./school";

export type UserRole = "admin" | "principal" | "deputy_principal" | "teacher" | "guest";

export type UserGender = "male" | "female";

export type AuthType = "google" | "credentials";

export type UserType = {
    id: string;
    email: string;
    role: UserRole;
    gender?: string;
    schoolId?: string;
    createdAt?: Date;
    updatedAt?: Date;
};

export type RegisterRequest = {
    name: string;
    email: string;
    password: string;
    role: UserRole;
    gender: UserGender;
    schoolName: string;
    city: string;
    level: SchoolLevel;
};

export type RegisterResponse = ActionResponse;

declare module "next-auth" {
    interface Session {
        user: {
            token?: string;
            name?: string;
            email?: string | null;
            gender?: UserGender;
            role?: UserRole;
            schoolId?: string;
            status?: string;
            maxAge?: number;
            createdAt?: Date;
        };
    }

    // Include JWT interface directly in next-auth module
    interface JWT {
        name?: string;
        role?: UserRole;
        schoolId?: string;
        status?: string;
        maxAge?: number;
        createdAt?: Date;
    }
}
