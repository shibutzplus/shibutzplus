"use client";

import React from "react";
import PrivatePageLayout from "@/components/layout/PrivatePageLayout/PrivatePageLayout";
import { HistoryTableProvider } from "@/context/HistoryTableContext";
import TopNav from "@/components/navigation/TopNav/TopNav";
import HistoryTopActions from "@/components/actions/HistoryTopActions/HistoryTopActions";

export default function HistoryLayout({ children }: { children: React.ReactNode }) {
  return (
    <HistoryTableProvider>
      <PrivatePageLayout
        CustomTopNav={<TopNav type="admin" actions={<HistoryTopActions />} />}
      >
        {children}
      </PrivatePageLayout>
    </HistoryTableProvider>
  );
}
