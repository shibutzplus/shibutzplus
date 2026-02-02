import type { Metadata } from "next";
import { AnnualViewProvider } from "@/context/AnnualViewContext";
import AnnualViewPageLayout from "../../../components/layout/pageLayouts/AnnualViewPageLayout/AnnualViewPageLayout";

export const metadata: Metadata = {
    title: "מערכת שנתית",
    robots: "noindex, nofollow",
};

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <AnnualViewProvider>
            <AnnualViewPageLayout>{children}</AnnualViewPageLayout>
        </AnnualViewProvider>
    );
}
