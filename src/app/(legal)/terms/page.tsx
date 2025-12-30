import "@/components/faq/faq.css";
import termsData from "@/resources/terms.json";

export const metadata = {
    title: "תנאי שימוש | שיבוץ+",
};

export default function TermsPage() {
    return (
        <div className="faq-container">
            <h1>{termsData.title}</h1>
            <div className="answer">
                <p>{termsData.intro}</p>
                {termsData.sections.map((section, index) => (
                    <p key={index}>
                        <strong>{section.title}</strong>
                        <br />
                        {section.content}
                    </p>
                ))}
            </div>
        </div>
    );
}
