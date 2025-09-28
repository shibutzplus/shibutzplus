// Server component layout: defines metadata and wraps children with the client layout
import type { Metadata } from "next";
import LayoutClient from "./layoutClient";

export const metadata: Metadata = {
    title: "המערכת שלי | שיבוץ+",
    robots: "noindex, nofollow",
};

export default function TeacherLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <LayoutClient>{children}</LayoutClient>;
}
