import type { Metadata } from "next";
import { AnnualViewProvider } from "@/context/AnnualViewContext";
import AnnualViewPageLayout from "@/components/layout/pageLayouts/AnnualViewPageLayout/AnnualViewPageLayout";

export const metadata: Metadata = {
    title: "מערכת לזמן חירום",
    robots: "noindex, nofollow",
};

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <AnnualViewProvider mode="emergency">
            <AnnualViewPageLayout>{children}</AnnualViewPageLayout>
        </AnnualViewProvider>
    );
}
