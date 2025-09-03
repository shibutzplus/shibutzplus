import React from "react";
import PrivatePageLayout from "@/components/layout/PrivatePageLayout/PrivatePageLayout";
import { DailyTableProvider } from "@/context/DailyTableContext";
import CommonTopNav from "@/components/navigation/CommonTopNav/CommonTopNav";
import DailyTopActions from "@/components/actions/DailyTopActions/DailyTopActions";

export default function DailyScheduleLayout({ children }: { children: React.ReactNode }) {
    return (
        <DailyTableProvider>
            <PrivatePageLayout
                CustomTopNav={<CommonTopNav type="admin" actions={<DailyTopActions />} />}
            >
                {children}
            </PrivatePageLayout>
        </DailyTableProvider>
    );
}
