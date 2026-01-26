import type { Metadata } from "next";
import { PortalProvider } from "@/context/PortalContext";
import { TeacherTableProvider } from "@/context/TeacherTableContext";

export const metadata: Metadata = {
    title: "המערכת שלי",
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
