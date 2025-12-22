"use server";

const EMAILJS_SERVICE_ID = process.env.EMAILJS_SERVICE_ID || "";
const EMAILJS_PUBLIC_KEY = process.env.EMAILJS_PUBLIC_KEY || "";
const EMAILJS_PRIVATE_KEY = process.env.EMAILJS_PRIVATE_KEY || "";
const EMAILJS_TEACHER_TEMPLATE_ID = process.env.EMAILJS_TEACHER_TEMPLATE_ID || "";
const EMAILJS_ADMIN_TEMPLATE_ID = process.env.EMAILJS_ADMIN_TEMPLATE_ID || "";

interface EmailJSResponse {
    status: number;
    text: string;
}

async function sendEmailAction(
    templateId: string,
    params: Record<string, unknown>,
): Promise<EmailJSResponse> {
    const payload = {
        service_id: EMAILJS_SERVICE_ID,
        template_id: templateId,
        user_id: EMAILJS_PUBLIC_KEY,
        accessToken: EMAILJS_PRIVATE_KEY,
        template_params: params,
    };

    try {
        const response = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        });

        if (response.ok) {
            return { status: 200, text: "OK" };
        } else {
            const text = await response.text();
            return { status: response.status, text: text || "Failed to send email" };
        }
    } catch (error: any) {
        console.error("EmailJS Error:", error);
        return { status: 500, text: error.message || "Internal Server Error" };
    }
}

export interface TeacherEmailParams {
    schoolCode: string;
    teacherCode: string;
    teacherName: string;
    message: string;
}

export interface AdminEmailParams {
    adminName: string;
    adminEmail: string;
    message: string;
}

export async function sendTeacherContactEmail(params: TeacherEmailParams) {
    console.log("ROY sendTeacherContactEmail", params);
    console.log("ROY EMAILJS_TEACHER_TEMPLATE_ID", EMAILJS_TEACHER_TEMPLATE_ID);
    const response = await sendEmailAction(
        EMAILJS_TEACHER_TEMPLATE_ID,
        params as unknown as Record<string, unknown>,
    );
    console.log("ROY response", response);
    if (response.status !== 200) {
        throw new Error(response.text);
    }
    return response;
}

export async function sendAdminContactEmail(params: AdminEmailParams) {
    const response = await sendEmailAction(
        EMAILJS_ADMIN_TEMPLATE_ID,
        params as unknown as Record<string, unknown>,
    );
    if (response.status !== 200) {
        throw new Error(response.text);
    }
    return response;
}
