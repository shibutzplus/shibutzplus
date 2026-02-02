import type { Metadata } from "next";
import { AnnualByTeacherProvider } from "@/context/AnnualByTeacherContext";
import AnnualTeacherPageLayout from "@/components/layout/pageLayouts/AnnualTeacherPageLayout/AnnualTeacherPageLayout";

export const metadata: Metadata = {
    title: "מערכת שנתית לפי מורה",
    robots: "noindex, nofollow",
};

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <AnnualByTeacherProvider>
            <AnnualTeacherPageLayout>{children}</AnnualTeacherPageLayout>
        </AnnualByTeacherProvider>
    );
}
