"use client";

import AuthHero from "@/components/AuthHero/AuthHero";
import LoginForm from "@/components/LoginForm/LoginForm";
import styles from "./login.module.css";
import { NextPage } from "next";

const LoginPage: NextPage = () => {
    return (
        <main className={styles.container}>
            <div className={styles.contentWrapper}>
                <AuthHero />
                <LoginForm />
            </div>
        </main>
    );
};

export default LoginPage;
