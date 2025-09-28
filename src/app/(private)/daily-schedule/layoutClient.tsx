"use client";

import React from "react";
import PrivatePageLayout from "@/components/layout/PrivatePageLayout/PrivatePageLayout";
import TopNav from "@/components/navigation/TopNav/TopNav";
import DailyTopActions from "@/components/actions/DailyTopActions/DailyTopActions";
import MobileNav from "@/components/navigation/MobileNav/MobileNav";
import { DailyTableProvider } from "@/context/DailyTableContext";
import { useMobileSize } from "@/hooks/useMobileSize";

export default function DailyScheduleLayout({ children }: { children: React.ReactNode }) {
    const isMobile = useMobileSize();

    return (
        <DailyTableProvider>
            <PrivatePageLayout CustomTopNav={<TopNav type="admin" actions={<DailyTopActions />} />}>
                <main>
                    <section style={{ marginBottom: isMobile ? "60px" : "0" }}>{children}</section>
                    {isMobile ? <MobileNav /> : null}
                </main>
            </PrivatePageLayout>
        </DailyTableProvider>
    );
}
