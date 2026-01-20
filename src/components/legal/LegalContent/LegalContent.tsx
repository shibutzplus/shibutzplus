import React from "react";
import styles from "./LegalContent.module.css";

interface Section {
    title: string;
    content: string;
}

interface LegalContentProps {
    title: string;
    intro: string;
    sections: Section[];
}

const LegalContent: React.FC<LegalContentProps> = ({ title, intro, sections }) => {
    return (
        <div className={styles.legalContainer}>
            <h1 className={styles.title}>{title}</h1>
            <div className={styles.intro}>
                <p>{intro}</p>
            </div>
            {sections.map((section, index) => (
                <div key={index} className={styles.section}>
                    <strong className={styles.sectionTitle}>{section.title}</strong>
                    <p className={styles.sectionContent}>{section.content}</p>
                </div>
            ))}
        </div>
    );
};

export default LegalContent;
