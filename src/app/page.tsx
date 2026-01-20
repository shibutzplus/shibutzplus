import { Metadata } from "next";
import LandingPage from "@/components/pages/LandingPage/LandingPage";

export const metadata: Metadata = {
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            "max-video-preview": -1,
            "max-image-preview": "large",
            "max-snippet": -1,
        },
    },
};

export default function Page() {
    return <LandingPage />;
}
