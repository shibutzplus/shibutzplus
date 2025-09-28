// Server component layout: defines metadata and wraps children with the client layout
import type { Metadata } from "next";
import HistoryLayoutClient from "./layoutClient";

export const metadata: Metadata = {
  title: "מערכות יומיות | שיבוץ+",
  robots: "noindex, nofollow",
};

export default function HistoryLayout({ children }: { children: React.ReactNode }) {
  return <HistoryLayoutClient>{children}</HistoryLayoutClient>;
}
