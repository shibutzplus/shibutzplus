"use client";

import AuthHero from "@/components/layout/AuthHero/AuthHero";
import LoginForm from "@/components/auth/LoginForm/LoginForm";
import styles from "./signIn.module.css";
import { NextPage } from "next";

const SignInPage: NextPage = () => {
    return (
        <main className={styles.container}>
            <div className={styles.contentWrapper}>
                <AuthHero />
                <LoginForm />
            </div>
        </main>
    );
};

export default SignInPage;
