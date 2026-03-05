import type { Metadata } from "next";
import { AnnualByClassProvider } from "@/context/AnnualByClassContext";
import AnnualClassPageLayout from "@/components/layout/pageLayouts/AnnualClassPageLayout/AnnualClassPageLayout";

export const metadata: Metadata = {
    title: "מערכת שנתית לפי כיתה",
    robots: "noindex, nofollow",
};

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <AnnualByClassProvider>
            <AnnualClassPageLayout>{children}</AnnualClassPageLayout>
        </AnnualByClassProvider>
    );
}
