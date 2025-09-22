import React from "react";
import PrivatePageLayout from "@/components/layout/PrivatePageLayout/PrivatePageLayout";
import { AnnualTableProvider } from "@/context/AnnualTableContext";
import TopNav from "@/components/navigation/TopNav/TopNav";
import { TeacherAnnualTableProvider } from "@/context/TeacherAnnualTableContext";
import TeacherAnnualTopActions from "@/components/actions/TeacherAnnualTopActions/TeacherAnnualTopActions";

export default function AnnualScheduleTeacherLayout({ children }: { children: React.ReactNode }) {
  return (
    <AnnualTableProvider>
      <TeacherAnnualTableProvider>
        <PrivatePageLayout
          CustomTopNav={<TopNav type="admin" actions={<TeacherAnnualTopActions />} />}
        >
          {children}
        </PrivatePageLayout>
      </TeacherAnnualTableProvider>
    </AnnualTableProvider>
  );
}
