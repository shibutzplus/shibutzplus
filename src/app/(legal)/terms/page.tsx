import LegalContent from "@/components/legal/LegalContent/LegalContent";
import termsData from "@/resources/terms.json";

export const metadata = {
    title: "תנאי שימוש",
    description: "תנאי השימוש והתקנון של פלטפורמת שיבוץ+. מידע על זכויות, חובות ותנאי השירות.",
    alternates: {
        canonical: "https://shibutzplus.com/terms",
    },
    robots: {
        index: true,
        follow: true,
    },
};

export default function TermsPage() {
    return (
        <LegalContent
            title={termsData.title}
            intro={termsData.intro}
            sections={termsData.sections}
        />
    );
}
