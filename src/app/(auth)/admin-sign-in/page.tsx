"use client";

import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import styles from "./signIn.module.css";
import HeroSection from "@/components/auth/HeroSection/HeroSection";
import Loading from "@/components/loading/Loading/Loading";
import Link from "next/link";
import { DEFAULT_REDIRECT } from "@/routes/protectedAuth";

const AdminSignInPage = () => {
    const router = useRouter();
    const [email, setEmail] = useState("shibutzplus@gmail.com");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        try {
            const res = await signIn("credentials", {
                email,
                password,
                redirect: false,
            });

            if (res?.error) {
                setError("פרטי ההתחברות שגויים");
                setIsLoading(false);
            } else {
                router.push(DEFAULT_REDIRECT);
                // Note: user state update will be handled by session provider,
                // but we push immediately. Real-world might want to wait for session interaction,
                // matching the existing sign-in flow.
            }
        } catch (err) {
            setError("אירעה שגיאה בהתחברות");
            setIsLoading(false);
        }
    };

    return (
        <main className={styles.container}>
            <section className={styles.mainSection}>
                <HeroSection title="כניסת מנהל מערכת" description="גישה מאובטחת למנהלים בלבד" />
                <form className={styles.formContainer} onSubmit={handleSubmit}>
                    <div className={styles.inputGroup}>
                        <label htmlFor="email" className={styles.label}>
                            אימייל
                        </label>
                        <input
                            type="email"
                            id="email"
                            className={styles.input}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className={styles.inputGroup}>
                        <label htmlFor="password" className={styles.label}>
                            סיסמה
                        </label>
                        <input
                            type="password"
                            id="password"
                            className={styles.input}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    {error && <div className={styles.error}>{error}</div>}

                    <button type="submit" className={styles.submitButton} disabled={isLoading}>
                        {isLoading && <Loading />}
                        התחבר
                    </button>

                    <Link href="/sign-in" className={styles.backLink}>
                        חזרה למסך התחברות
                    </Link>
                </form>
            </section>
        </main>
    );
};

export default AdminSignInPage;
