import LegalContent from "@/components/legal/LegalContent/LegalContent";
import privacyData from "@/resources/privacy.json";

export const metadata = {
    title: "מדיניות פרטיות",
    description: "מדיניות הפרטיות של שיבוץ+. כאן תוכלו לקרוא כיצד אנו שומרים על המידע שלכם ומשתמשים בו.",
    alternates: {
        canonical: "https://shibutzplus.com/privacy",
    },
    robots: {
        index: true,
        follow: true,
    },
};

export default function PrivacyPage() {
    return (
        <LegalContent
            title={privacyData.title}
            intro={privacyData.intro}
            sections={privacyData.sections}
        />
    );
}
