import type { Metadata } from "next";
import PageLayout from "@/components/layout/PageLayout/PageLayout";
import DailyTopNav from "@/components/navigation/topNavs/DailyTopNav/DailyTopNav";
import { DailyTableProvider } from "@/context/DailyTableContextP";

export const metadata: Metadata = {
    title: "שיבוץ יומי | שיבוץ+",
    robots: "noindex, nofollow",
};

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <DailyTableProvider>
            <PageLayout TopNav={<DailyTopNav />}>{children}</PageLayout>
        </DailyTableProvider>
    );
}
