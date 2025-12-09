import type { Metadata } from "next";
import FaqPageLayout from "@/components/layout/pageLayouts/FaqPageLayout/FaqPageLayout";

export const metadata: Metadata = {
    title: "שאלות נפוצות | שיבוץ+",
    robots: "noindex, nofollow",
};

export default function FAQManagerLayout({ children }: { children: React.ReactNode }) {
    return <FaqPageLayout type="private">{children}</FaqPageLayout>;
}
