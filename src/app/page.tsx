import { Metadata } from "next";
import LandingPage from "@/components/pages/LandingPage/LandingPage";

export const metadata: Metadata = {
    robots: {
        index: true,
        follow: true,
    },
    // Keep other metadata. layout.tsx has the defaults
};

export default function Page() {
    return <LandingPage />;
}
