import { USER_ROLES } from "@/models/constant/auth";
import { ActionResponse } from "@/models/types/actions";
import messages from "@/resources/messages";
import { getExpireTime } from "./time";
import { compare } from "bcrypt-ts";

/**
 * Checks if the user is authenticated and validates required parameters
 * @param requiredParams Object containing parameters to validate with their names
 * @returns An ActionResponse object with success status and message
 */
export async function checkAuthAndParams(
    requiredParams: Record<string, any>,
): Promise<ActionResponse | null> {
    // Dynamic import to avoid loading next-auth at module initialization time
    // (prevents Edge Runtime build failures for pages that don't need auth)
    const { getServerSession } = await import("next-auth");
    const { authOptions } = await import("@/lib/auth");

    // Check if user is authenticated
    const session = await getServerSession(authOptions);
    if (!session) {
        return {
            success: false,
            message: messages.auth.unauthorized,
        };
    }

    // Check if all required parameters are provided
    for (const [paramName, paramValue] of Object.entries(requiredParams)) {
        if (paramValue === null || paramValue === undefined || paramValue === "") {
            return {
                success: false,
                message: `${paramName} ${messages.auth.paramRequired}`,
            };
        }
    }

    // If all checks pass, return null (indicating no error)
    return null;
}

/**
 * Public access to get data
 * @param requiredParams Object containing parameters to validate with their names
 * @returns An ActionResponse object with success status and message
 */
export async function publicAuthAndParams(
    requiredParams: Record<string, any>,
): Promise<ActionResponse | null> {
    // Check if all required parameters are provided
    for (const [paramName, paramValue] of Object.entries(requiredParams)) {
        if (paramValue === null || paramValue === undefined || paramValue === "") {
            return {
                success: false,
                message: `${paramName} ${messages.auth.paramRequired}`,
            };
        }
    }

    // If all checks pass, return null (indicating no error)
    return null;
}

/**
 * Checks if the user is not a guest
 * @returns An ActionResponse object with success status and message if guest, otherwise null
 */
export async function checkIsNotGuest(): Promise<ActionResponse | null> {
    // Dynamic import to avoid loading next-auth at module initialization time
    const { getServerSession } = await import("next-auth");
    const { authOptions } = await import("@/lib/auth");

    const session = await getServerSession(authOptions);
    if (session?.user?.role === USER_ROLES.GUEST) {
        return {
            success: false,
            message: messages.auth.unauthorized,
        };
    }
    return null;
}

export const authUser = async (
    response: any,
    credentialsPass: string,
    credentialsRemember: string,
) => {
    const {
        data: { id, name, email, password, role, gender, schoolId, status },
    } = response;
    const isValid = await compare(credentialsPass, password);

    if (isValid) {
        const maxAge = getExpireTime(credentialsRemember === "true");
        return {
            id,
            name,
            email,
            role,
            gender,
            schoolId,
            status,
            maxAge: maxAge,
        };
    } else {
        throw new Error("Invalid password");
    }
};
