"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import ContactUs from "../ContactUs/ContactUs";
import styles from "./FaqContent.module.css";

interface FaqItem {
    question: string;
    answer: React.ReactNode;
}

interface FaqContentProps {
    title?: string;
    subtitle?: string;
    faqItems: FaqItem[];
    onSendContact: (message: string) => Promise<void>;
}

const FaqAccordionItem = ({ item, index }: { item: FaqItem; index: number }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <motion.div
            className={styles.faqItem}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
                duration: 0.5,
                delay: index * 0.1,
                ease: "easeOut",
            }}
        >
            <div 
                className={`${styles.question} ${isOpen ? styles.open : ""}`} 
                onClick={() => setIsOpen(!isOpen)}
            >
                <span>{item.question}</span>
                <span className={styles.icon}>{isOpen ? "-" : "+"}</span>
            </div>
            <AnimatePresence initial={false}>
                {isOpen && (
                    <motion.div
                        key="content"
                        initial="collapsed"
                        animate="open"
                        exit="collapsed"
                        variants={{
                            open: { opacity: 1, height: "auto", marginBottom: 10 },
                            collapsed: { opacity: 0, height: 0, marginBottom: 0 }
                        }}
                        transition={{ duration: 0.3, ease: [0.04, 0.62, 0.23, 0.98] }}
                        className={styles.answerWrapper}
                    >
                        <div className={styles.answer}>{item.answer}</div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default function FaqContent({
    title = "שאלות נפוצות",
    subtitle,
    faqItems,
    onSendContact
}: FaqContentProps) {
    return (
        <div className={styles.faqContainer}>
            <h1>{title}</h1>
            {subtitle && <p className={styles.subtitle}>{subtitle}</p>}

            <div className={styles.faqList}>
                {faqItems.map((item, index) => (
                    <FaqAccordionItem key={index} item={item} index={index} />
                ))}
            </div>

            <br />
            <ContactUs onSend={onSendContact} />
        </div>
    );
}
