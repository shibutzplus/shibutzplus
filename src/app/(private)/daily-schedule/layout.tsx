import type { Metadata } from "next";
import DailyScheduleLayoutClient from "./layoutClient";

export const metadata: Metadata = {
  title: "שיבוץ יומי | שיבוץ+",
  robots: "noindex, nofollow",
};

export default function DailyScheduleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DailyScheduleLayoutClient>{children}</DailyScheduleLayoutClient>;
}
