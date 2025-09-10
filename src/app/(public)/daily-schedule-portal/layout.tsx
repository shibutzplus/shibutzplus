import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "מערכת בית ספרית | שיבוץ+",
    robots: "noindex, nofollow",
};

export default function DailyPortalLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
