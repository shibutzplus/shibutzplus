import type { Metadata } from "next";
import { AnnualAltByDayProvider } from "@/context/AnnualAltByDayContext";
import AnnualAltBuildPageLayout from "@/components/layout/pageLayouts/AnnualAltBuildPageLayout/AnnualAltBuildPageLayout";

export const metadata: Metadata = {
    title: "מערכת אלטרנטיבית",
    robots: "noindex, nofollow",
};

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <AnnualAltByDayProvider>
            <AnnualAltBuildPageLayout>{children}</AnnualAltBuildPageLayout>
        </AnnualAltByDayProvider>
    );
}
