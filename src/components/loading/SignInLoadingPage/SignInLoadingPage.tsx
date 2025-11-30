import React from "react";
import styles from "./SignInLoadingPage.module.css";
import Preloader from "@/components/ui/Preloader/Preloader";

const SignInLoadingPage: React.FC = () => {
    return (
        <main className={styles.container} aria-busy="true" aria-live="polite">
            <div className={styles.preloaderWrapper}>
                <Preloader />
            </div>
            <p className={styles.loading}>מתחבר למערכת...</p>
        </main>
    );
};

export default SignInLoadingPage;
