import type { Metadata } from "next";
import FAQManagerLayoutClient from "./layoutClient";

export const metadata: Metadata = {
  title: "שאלות נפוצות | שיבוץ+",
  robots: "noindex, nofollow",
};

export default function FAQManagerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <FAQManagerLayoutClient>{children}</FAQManagerLayoutClient>;
}
