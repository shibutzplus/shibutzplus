// Extend the next-auth types
import "next-auth";
import { ActionResponse } from "./actions";

export type UserRole = "admin" | "teacher";

export type UserGender = "male" | "female";

export type UserType = {
    id: string;
    email: string;
    role: UserRole;
    gender?: string;
    schoolId: string;
    createdAt?: Date;
    updatedAt?: Date;
};

export type RegisterRequest = {
    name: string;
    email: string;
    password: string;
    role: UserRole;
    gender: UserGender;
    school: string;
};

export type RegisterResponse = ActionResponse;

export type SignInRequest = {
    email: string;
    password: string;
    remember: boolean;
};

export type SignInResponse = ActionResponse;

declare module "next-auth" {
    interface Session {
        user: {
            id?: string;
            name?: string;
            email?: string | null;
            gender?: UserGender;
            role?: UserRole;
            schoolId?: string;
        };
    }

    // Include JWT interface directly in next-auth module
    interface JWT {
        name?: string;
        role?: UserRole;
        schoolId?: string;
    }
}
