"use client";

import React from "react";
import PrivatePageLayout from "@/components/layout/PrivatePageLayout/PrivatePageLayout";
import { HistoryTableProvider } from "@/context/HistoryTableContext";
import CommonTopNav from "@/components/navigation/CommonTopNav/CommonTopNav";
import HistoryTopActions from "@/components/actions/HistoryTopActions/HistoryTopActions";

export default function HistoryLayout({ children }: { children: React.ReactNode }) {
  return (
    <HistoryTableProvider>
      <PrivatePageLayout
        CustomTopNav={<CommonTopNav kind="admin" actions={<HistoryTopActions />} />}
      >
        {children}
      </PrivatePageLayout>
    </HistoryTableProvider>
  );
}
