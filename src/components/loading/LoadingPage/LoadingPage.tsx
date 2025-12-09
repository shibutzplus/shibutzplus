import React from "react";
import styles from "./LoadingPage.module.css";
import Preloader from "@/components/ui/Preloader/Preloader";

const LoadingPage: React.FC = () => {
    // TODO: the logo need white space from the right for balance center position with the loading
    return (
        <main className={styles.container} aria-busy="true" aria-live="polite">
            <section className={styles.loadingSection}>
                <Preloader />
            </section>
        </main>
    );
};

export default LoadingPage;
