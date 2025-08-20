import React from "react";
import styles from "./onboarding.module.css";
import { OnboardingProvider } from "@/context/onboardingContext";
import TopNav from "@/components/navigation/TopNav/TopNav";

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <OnboardingProvider>
            <main className={styles.container}>
            <TopNav/>
                <div className={styles.card}>{children}</div>
            </main>
        </OnboardingProvider>
    );
}
