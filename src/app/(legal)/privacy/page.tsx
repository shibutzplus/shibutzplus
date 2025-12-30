import "@/components/faq/faq.css";
import privacyData from "@/resources/privacy.json";

export const metadata = {
    title: "מדיניות פרטיות | שיבוץ+",
};

export default function PrivacyPage() {
    return (
        <div className="faq-container">
            <h1>{privacyData.title}</h1>
            <div className="answer">
                <p>{privacyData.intro}</p>
                {privacyData.sections.map((section, index) => (
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
