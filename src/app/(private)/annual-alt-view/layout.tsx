import type { Metadata } from "next";
import { AnnualAltViewProvider } from "@/context/AnnualAltViewContext";
import AnnualAltViewPageLayout from "@/components/layout/pageLayouts/AnnualAltViewPageLayout/AnnualAltViewPageLayout";

export const metadata: Metadata = {
    title: "מערכת זמן חירום",
    robots: "noindex, nofollow",
};

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <AnnualAltViewProvider>
            <AnnualAltViewPageLayout>{children}</AnnualAltViewPageLayout>
        </AnnualAltViewProvider>
    );
}
