import React from "react";
import styles from "./SignInLoadingPage.module.css";
import Loading from "@/components/core/Loading/Loading";

const SignInLoadingPage: React.FC = () => {
    return (
        <main className={styles.container} aria-busy="true" aria-live="polite">
            <section className={styles.loadingSection}>
                <Loading />
                <p className={styles.loading}>מתחבר למערכת...</p>
            </section>
        </main>
    );
};

export default SignInLoadingPage;
