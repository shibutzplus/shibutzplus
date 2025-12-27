import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'שיבוץ+ | ניהול מערכת שעות חכמה',
  description: 'הכלי המתקדם ביותר לסגני מנהלים למציאת ממלאי מקום וניהול שיבוצים יומיים בלחיצת כפתור.',
};

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
