import type { Metadata } from "next";
import { PortalProvider } from "@/context/PortalContext";
import PortalPageLayout from "@/components/layout/pageLayouts/PortalPageLayout/PortalPageLayout";
import { TeacherTableProvider } from "@/context/TeacherTableContext";

export const metadata: Metadata = {
    title: "המערכת שלי | שיבוץ+",
    robots: "noindex, nofollow",
};

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <PortalProvider>
            {/* TODO: TeacherTableProvider only need to be on teacher-portal but PortalPageLayout need it */}
            <TeacherTableProvider>
                {children}
            </TeacherTableProvider>
        </PortalProvider>
    );
}
