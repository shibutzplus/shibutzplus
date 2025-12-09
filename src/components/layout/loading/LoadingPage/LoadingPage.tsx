import React from "react";
import styles from "./LoadingPage.module.css";
import Loading from "@/components/core/Loading/Loading";
import Logo from "@/components/core/Logo/Logo";

const LoadingPage: React.FC = () => {
    return (
        <main className={styles.container} aria-busy="true" aria-live="polite">
            <section className={styles.loadingSection}>
                <Logo size="S" />
                <Loading />
            </section>
        </main>
    );
};

export default LoadingPage;
