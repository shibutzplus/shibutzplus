import type { Metadata } from "next";
import { DailyTableProvider } from "@/context/DailyTableContext";
import DailyPageLayout from "@/components/layout/pageLayouts/DailyPageLayout/DailyPageLayout";

export const metadata: Metadata = {
    title: "שיבוץ יומי | שיבוץ+",
    robots: "noindex, nofollow",
};

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <DailyTableProvider>
            <DailyPageLayout>{children}</DailyPageLayout>
        </DailyTableProvider>
    );
}
