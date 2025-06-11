import { OurEmail, OurWebsite, OurLogo, OurName } from "@/models/constant";
import {
    Body,
    Container,
    Column,
    Head,
    Hr,
    Html,
    Img,
    Link,
    Preview,
    Row,
    Section,
    Text,
    Button,
} from "@react-email/components";
import * as React from "react";

interface WelcomeEmailProps {
    userName?: string;
    userEmail?: string;
    companyName?: string;
    websiteUrl?: string;
    logoUrl?: string;
    supportEmail?: string;
}

export const WelcomeEmail = ({
    userName = "משתמש יקר",
    userEmail = "user@example.com",
    companyName = OurName,
    websiteUrl = OurWebsite,
    logoUrl = OurLogo,
    supportEmail = OurEmail,
}: WelcomeEmailProps) => {
    const previewText = `ברוכים הבאים ${userName}! אנחנו שמחים שהצטרפת אלינו`;

    return (
        <Html dir="rtl" lang="he">
            <Head />
            <Preview>{previewText}</Preview>
            <Body style={main}>
                <Container style={container}>
                    <Section style={header}>
                        <Row>
                            <Column align="right">
                                <Img
                                    src={logoUrl}
                                    width="150"
                                    height="50"
                                    alt={companyName}
                                    style={logo}
                                />
                            </Column>
                            <Column align="left">
                                <Text style={headerDate}>
                                    {new Date().toLocaleDateString("he-IL", {
                                        weekday: "long",
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric",
                                    })}
                                </Text>
                            </Column>
                        </Row>
                    </Section>

                    <Hr style={hr} />

                    <Section style={content}>
                        <Text style={title}>🎉 ברוכים הבאים ל{companyName}!</Text>

                        <Text style={greeting}>שלום {userName},</Text>

                        <Text style={paragraph}>
                            אנחנו שמחים מאוד לקבל אותך כחבר חדש במשפחה שלנו! הרגע עשית את הצעד
                            הראשון לקראת חוויה מדהימה.
                        </Text>

                        <Section style={welcomeCard}>
                            <Text style={cardTitle}>🚀 מה הלאה?</Text>
                            <Text style={cardText}>
                                • התחל לחקור את הפלטפורמה שלנו
                                <br />
                                • גלה את כל התכונות החדשות והמרגשות
                                <br />
                                • הצטרף לקהילה שלנו ותתחבר עם משתמשים אחרים
                                <br />• קבל תמיכה מצוות השירות המעולה שלנו
                            </Text>
                        </Section>

                        <Section style={detailsCard}>
                            <Text style={cardTitle}>📧 פרטי החשבון שלך</Text>
                            <Row style={detailRow}>
                                <Column>
                                    <Text style={value}>{userName}</Text>
                                </Column>
                                <Column style={detailLabel}>
                                    <Text style={label}>:שם</Text>
                                </Column>
                            </Row>
                            <Row style={detailRow}>
                                <Column>
                                    <Link href={`mailto:${userEmail}`} style={emailLink}>
                                        {userEmail}
                                    </Link>
                                </Column>
                                <Column style={detailLabel}>
                                    <Text style={label}>:אימייל</Text>
                                </Column>
                            </Row>
                        </Section>

                        <Section style={buttonContainer}>
                            <Button style={button} href={websiteUrl}>
                                התחל עכשיו!
                            </Button>
                        </Section>

                        <Hr style={hr} />

                        <Section style={supportSection}>
                            <Text style={supportTitle}>🤝 זקוק לעזרה?</Text>
                            <Text style={paragraph}>
                                הצוות שלנו כאן כדי לעזור לך! אם יש לך שאלות או זקוק לתמיכה, אל תהסס
                                לפנות אלינו בכל עת.
                            </Text>
                            <Text style={paragraph}>
                                <Link href={`mailto:${supportEmail}`} style={supportLink}>
                                    {supportEmail}
                                </Link>
                                {" או בקר במרכז העזרה שלנו."}
                            </Text>
                        </Section>
                    </Section>

                    <Hr style={hr} />
                    <Section style={footer}>
                        <Text style={footerText}>תודה שבחרת ב{companyName}!</Text>
                        <Text style={footerText}>
                            <Link href={websiteUrl} style={footerLink}>
                                אתר הבית
                            </Link>
                            {" • "}
                            <Link href={`${websiteUrl}/contact`} style={footerLink}>
                                צור קשר
                            </Link>
                            {" • "}
                            <Link href={`${websiteUrl}/privacy`} style={footerLink}>
                                מדיניות פרטיות
                            </Link>
                        </Text>
                        <Text style={footerNote}>
                            קיבלת אימייל זה כי נרשמת לשירותים שלנו. אם אינך רוצה לקבל עוד אימיילים,
                            <Link href="#" style={footerLink}>
                                {" "}
                                בטל מנוי כאן
                            </Link>
                            .
                        </Text>
                    </Section>
                </Container>
            </Body>
        </Html>
    );
};

const main = {
    backgroundColor: "#f6f9fc",
    fontFamily: '"Segoe UI", Tahoma, Arial, sans-serif',
    direction: "rtl" as const,
    textAlign: "right" as const,
};

const container = {
    backgroundColor: "#ffffff",
    margin: "0 auto",
    padding: "20px 0 48px",
    marginBottom: "64px",
    maxWidth: "600px",
    direction: "rtl" as const,
};

const header = {
    padding: "0 48px",
    marginBottom: "20px",
    direction: "rtl" as const,
};

const logo = {
    margin: "0 0",
};

const headerDate = {
    fontSize: "14px",
    lineHeight: "24px",
    color: "#6b7280",
    textAlign: "left" as const,
    margin: "0",
    direction: "rtl" as const,
};

const content = {
    padding: "0 48px",
    direction: "rtl" as const,
    textAlign: "right" as const,
};

const title = {
    fontSize: "28px",
    lineHeight: "36px",
    fontWeight: "700",
    color: "#111827",
    margin: "0 0 24px",
    textAlign: "center" as const,
};

const greeting = {
    fontSize: "18px",
    lineHeight: "28px",
    fontWeight: "600",
    color: "#111827",
    margin: "0 0 16px",
};

const paragraph = {
    fontSize: "16px",
    lineHeight: "26px",
    color: "#374151",
    margin: "0 0 16px",
    textAlign: "right" as const,
};

const welcomeCard = {
    backgroundColor: "#f0f9ff",
    border: "1px solid #7dd3fc",
    borderRadius: "12px",
    padding: "24px",
    margin: "32px 0",
    textAlign: "right" as const,
};

const detailsCard = {
    backgroundColor: "#f8fafc",
    border: "1px solid #e5e7eb",
    borderRadius: "12px",
    padding: "24px",
    margin: "24px 0",
    direction: "rtl" as const,
};

const cardTitle = {
    fontSize: "18px",
    lineHeight: "24px",
    fontWeight: "600",
    color: "#111827",
    margin: "0 0 16px",
    textAlign: "right" as const,
};

const cardText = {
    fontSize: "16px",
    lineHeight: "26px",
    color: "#374151",
    margin: "0",
    textAlign: "right" as const,
};

const detailRow = {
    marginBottom: "12px",
    direction: "rtl" as const,
};

const detailLabel = {
    width: "80px",
    verticalAlign: "top",
    textAlign: "right" as const,
};

const label = {
    fontSize: "14px",
    lineHeight: "20px",
    fontWeight: "500",
    color: "#6b7280",
    margin: "0",
    textAlign: "right" as const,
};

const value = {
    fontSize: "16px",
    lineHeight: "20px",
    color: "#111827",
    margin: "0",
    textAlign: "right" as const,
};

const emailLink = {
    fontSize: "16px",
    lineHeight: "20px",
    color: "#2563eb",
    textDecoration: "none",
};

const buttonContainer = {
    textAlign: "center" as const,
    margin: "32px 0",
};

const button = {
    backgroundColor: "#2563eb",
    borderRadius: "8px",
    color: "#ffffff",
    fontSize: "18px",
    fontWeight: "700",
    textDecoration: "none",
    textAlign: "center" as const,
    display: "inline-block",
    padding: "16px 32px",
    border: "none",
    boxShadow: "0 4px 14px 0 rgba(37, 99, 235, 0.39)",
};

const tipsSection = {
    margin: "32px 0",
    textAlign: "right" as const,
};

const tipsTitle = {
    fontSize: "18px",
    lineHeight: "24px",
    fontWeight: "600",
    color: "#111827",
    margin: "0 0 16px",
    textAlign: "right" as const,
};

const supportSection = {
    backgroundColor: "#fef7f0",
    border: "1px solid #fed7aa",
    borderRadius: "12px",
    padding: "24px",
    margin: "32px 0",
    textAlign: "right" as const,
};

const supportTitle = {
    fontSize: "18px",
    lineHeight: "24px",
    fontWeight: "600",
    color: "#111827",
    margin: "0 0 12px",
    textAlign: "right" as const,
};

const supportLink = {
    color: "#2563eb",
    textDecoration: "none",
    fontWeight: "600",
};

const footer = {
    padding: "0 48px",
    marginTop: "32px",
    textAlign: "center" as const,
    direction: "rtl" as const,
};

const footerText = {
    fontSize: "16px",
    lineHeight: "24px",
    color: "#6b7280",
    margin: "0 0 12px",
    textAlign: "center" as const,
};

const footerNote = {
    fontSize: "14px",
    lineHeight: "20px",
    color: "#9ca3af",
    margin: "16px 0 0",
    textAlign: "center" as const,
};

const footerLink = {
    color: "#2563eb",
    textDecoration: "none",
};

const hr = {
    borderColor: "#e5e7eb",
    margin: "20px 0",
};

export default WelcomeEmail;
