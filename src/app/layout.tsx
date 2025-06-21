import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { MainContextProvider } from "@/context/MainContext";
import "./globals.css";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "שיבוץ+",
    description: "מערכת ניהול בתי ספר לסגנית",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="he" dir="rtl">
            <body className={`${geistSans.variable} ${geistMono.variable}`}>
                <MainContextProvider>{children}</MainContextProvider>
            </body>
        </html>
    );
}
