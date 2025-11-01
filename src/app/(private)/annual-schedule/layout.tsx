// Server component layout: defines metadata and wraps children with the client layout
import type { Metadata } from "next";
import AnnualScheduleLayoutClient from "./layoutClient";

export const metadata: Metadata = {
    title: "מערכת שבועית | שיבוץ+",
    robots: "noindex, nofollow",
};

export default function AnnualScheduleLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <AnnualScheduleLayoutClient>{children}</AnnualScheduleLayoutClient>;
}
