import React from "react";
import PrivatePageLayout from "@/components/layout/PrivatePageLayout/PrivatePageLayout";
import { DailyTableProvider } from "@/context/DailyTableContext";
import CommonTopNav from "@/components/navigation/CommonTopNav/CommonTopNav";
import DailyTopActions from "@/components/actions/DailyTopActions/DailyTopActions";

export default function DailyScheduleLayout({ children }: { children: React.ReactNode }) {
  return (
    <DailyTableProvider>
      <PrivatePageLayout
        CustomTopNav={
          // hamburger + page title + date/class selectors + logo
          <CommonTopNav kind="admin" actions={<DailyTopActions />} />
        }
      >
        {children}
      </PrivatePageLayout>
    </DailyTableProvider>
  );
}
