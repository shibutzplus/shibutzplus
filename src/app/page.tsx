import { Metadata } from "next";
import LandingPage from "@/components/pages/LandingPage/LandingPage";

export const metadata: Metadata = {
    title: "שיבוץ+ | הדרך הקלה לניהול מערכת שעות",
    description: "המערכת החכמה לשיבוץ מורים ומילוי מקום בבתי ספר. חסכו זמן יקר בניהול השינויים היומיים במערכת.",
};

export default function Page() {
    return <LandingPage />;
}
