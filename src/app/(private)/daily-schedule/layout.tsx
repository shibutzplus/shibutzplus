import React from "react";
import TopNav from "@/components/navigation/TopNav/TopNav";
import PrivatePageLayout from "@/components/layout/PrivatePageLayout/PrivatePageLayout";
import { DailyTableProvider } from "@/context/DailyTableContext";
import DailyTopActions from "@/components/actions/DailyTopActions/DailyTopActions";

export default function DailyScheduleLayout({ children }: { children: React.ReactNode }) {
  return (
    <DailyTableProvider>
      <PrivatePageLayout
        CustomTopNav={<TopNav Actions={<DailyTopActions />} />}
      >
        {children}
      </PrivatePageLayout>
    </DailyTableProvider>
  );
}
