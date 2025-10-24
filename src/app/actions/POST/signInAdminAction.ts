"use server";

import msg from "@/resources/messages";
import { db, schema, executeQuery } from "@/db";

interface AdminSignInRequest {
    systemPassword: string;
}

interface AdminSignInResponse {
    success: boolean;
    message: string;
    requiresGoogleAuth?: boolean;
}

export const signInAdminAction = async (params: AdminSignInRequest): Promise<AdminSignInResponse> => {
    try {
        const { systemPassword } = params;

        // First check system password
        if (!systemPassword) {
            return { success: false, message: "סיסמת מערכת נדרשת" };
        }

        if (systemPassword !== process.env.SYSTEM_PASSWORD) {
            return { success: false, message: "סיסמת מערכת שגויה" };
        }

        // If system password is correct, indicate that Google auth is required
        return { 
            success: true, 
            message: "סיסמת מערכת נכונה - נא להתחבר עם Google", 
            requiresGoogleAuth: true 
        };
    } catch (error) {
        console.error("Admin sign in error:", error);
        return { success: false, message: msg.common.serverError };
    }
};

// Server-side function to validate admin email after Google authentication
export const validateAdminEmail = async (email: string): Promise<{ success: boolean; message: string }> => {
    try {
        if (email !== process.env.NEXT_PUBLIC_POWER_USER_EMAIL) {
            return { 
                success: false, 
                message: "אין לך הרשאות מנהל מערכת" 
            };
        }

        return { 
            success: true, 
            message: "התחברות מנהל מערכת בוצעה בהצלחה" 
        };
    } catch (error) {
        console.error("Admin email validation error:", error);
        return { success: false, message: msg.common.serverError };
    }
};

// Check if user is admin after authentication
export const checkIsAdminUser = async (email: string): Promise<{ isAdmin: boolean; message?: string }> => {
    try {
        const isAdmin = email === process.env.NEXT_PUBLIC_POWER_USER_EMAIL;
        return { 
            isAdmin,
            message: isAdmin ? undefined : "אין לך הרשאות מנהל מערכת"
        };
    } catch (error) {
        console.error("Admin check error:", error);
        return { isAdmin: false, message: msg.common.serverError };
    }
};

// Validate admin and return schools if valid
export const getSchoolsForAdmin = async (email: string): Promise<{ 
    success: boolean; 
    message?: string; 
    schools?: Array<{ id: string; name: string }> 
}> => {
    try {
        // First validate admin
        const adminCheck = await checkIsAdminUser(email);
        
        if (!adminCheck.isAdmin) {
            return {
                success: false,
                message: adminCheck.message || "אין לך הרשאות מנהל מערכת"
            };
        }

        // If admin is valid, fetch schools
        const rows = await executeQuery(async () => {
            return await db.select().from(schema.schools);
        });

        // Normalize to {id, name}
        const schools = (rows as any[]).map((s) => ({
            id: s.id,
            name: s.data?.name ?? s.name ?? "Unnamed",
        }));

        return {
            success: true,
            schools
        };
    } catch (error) {
        console.error("Get schools for admin error:", error);
        return { 
            success: false, 
            message: msg.common.serverError 
        };
    }
};
