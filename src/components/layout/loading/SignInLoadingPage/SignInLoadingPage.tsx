import React from "react";
import styles from "./SignInLoadingPage.module.css";
import Loading from "@/components/core/Loading/Loading";
import Logo from "@/components/core/Logo/Logo";

const SignInLoadingPage: React.FC = () => {
    return (
        <main className={styles.container} aria-busy="true" aria-live="polite">
            <section className={styles.loadingSection}>
                <Logo size="S" />
                <p className={styles.loading}>מתחבר למערכת...</p>
                <Loading />
            </section>
        </main>
    );
};

export default SignInLoadingPage;
