import type { Metadata } from "next";
import { AnnualTableProvider } from "@/context/AnnualTableContext";
import AnnualPageLayout from "@/components/layout/pageLayouts/AnnualPageLayout/AnnualPageLayout";

export const metadata: Metadata = {
    title: "מערכת שבועית | שיבוץ+",
    robots: "noindex, nofollow",
};

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <AnnualTableProvider>
            <AnnualPageLayout>{children}</AnnualPageLayout>
        </AnnualTableProvider>
    );
}
