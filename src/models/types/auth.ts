// Extend the next-auth types
import "next-auth";
import { ActionResponse } from "./actions";
import { SchoolLevel } from "./school";
import { USER_ROLES, USER_GENDER, AUTH_TYPE } from "../constant/auth";

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];
export type UserGender = typeof USER_GENDER[keyof typeof USER_GENDER];
export type AuthType = typeof AUTH_TYPE[keyof typeof AUTH_TYPE];

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
