import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { render } from "@react-email/render";
import WelcomeEmail from "../../../emails/WelcomeEmail";
import { OurEmail, OurLogo, OurName, OurWebsite } from "@/models/constant";

/**
 * Another option without 2FA is Resend package
 */

export async function POST(request: NextRequest) {
    try {
        const { to, subject, message, senderName, senderEmail } = await request.json();

        if (!to || !subject || !message) {
            return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
        }

        // Create transporter using Gmail SMTP
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        // Render the React Email template
        const emailHtml = await render(
            WelcomeEmail({
                userName: senderName || "משתמש יקר",
                userEmail: senderEmail || "unknown@example.com",
                companyName: process.env.COMPANY_NAME || OurName,
                websiteUrl: process.env.WEBSITE_URL || OurWebsite,
                logoUrl: process.env.LOGO_URL || OurLogo,
                supportEmail: process.env.SUPPORT_EMAIL || OurEmail,
            }),
        );

        // Generate plain text version in Hebrew
        const emailText = `
ברוכים הבאים!

שלום ${senderName || "משתמש יקר"},

אנחנו שמחים מאוד לקבל אותך כחבר חדש במשפחה שלנו!

פרטי החשבון:
שם: ${senderName || "משתמש יקר"}
אימייל: ${senderEmail || "unknown@example.com"}

הודעה: ${message}

---
תודה שבחרת בשירותים שלנו.
        `.trim();

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: to,
            subject: `🎉 ברוכים הבאים ${senderName || "משתמש יקר"}!`,
            text: emailText,
            html: emailHtml,
        };

        await transporter.sendMail(mailOptions);

        return NextResponse.json({ message: "Email sent successfully" }, { status: 200 });
    } catch (error) {
        console.error("Email sending error:", error);
        return NextResponse.json({ message: "Failed to send email" }, { status: 500 });
    }
}
