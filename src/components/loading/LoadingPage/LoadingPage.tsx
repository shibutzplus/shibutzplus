import React from "react";
import styles from "./LoadingPage.module.css";
import Logo from "@/components/ui/Logo/Logo";
import Loading from "@/components/loading/Loading/Loading";

const LoadingPage: React.FC = () => {
    // TODO: the logo need white space from the right for balance center position with the loading
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
