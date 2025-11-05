import type { Metadata } from "next";
import { AnnualTableProvider } from "@/context/AnnualTableContext";
import PageLayout from "@/components/layout/PageLayout/PageLayout";
import AnnualTopNav from "@/components/navigation/topNavs/AnnualTopNav/AnnualTopNav";

export const metadata: Metadata = {
    title: "מערכת שבועית | שיבוץ+",
    robots: "noindex, nofollow",
};

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <AnnualTableProvider>
            <PageLayout TopNav={<AnnualTopNav />} >{children}</PageLayout>
        </AnnualTableProvider>
    );
}
