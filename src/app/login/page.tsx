"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import AuthInputText from "@/components/ui/AuthInputText/AuthInputText";
import AuthInputPassword from "@/components/ui/AuthInputPassword/AuthInputPassword";
import AuthBtn from "@/components/ui/AuthBtn/AuthBtn";
import styles from "./login.module.css";
import Link from "next/link";
import routePath from "@/models/routes";

const LoginPage: React.FC = () => {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [remember, setRemember] = useState(false);
    const [error, setError] = useState<string>("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        const res = await signIn("credentials", {
            redirect: false,
            email,
            password,
            remember,
        });

        if (res?.error) {
            setError(res.error);
        } else {
            router.push(routePath.dashboard.p);
        }

        setIsLoading(false);
    };

    return (
        <div className={styles.container}>
            <div className={styles.formContainer}>
                <h1 className={styles.title}>Login</h1>
                <form className={styles.form} onSubmit={handleSubmit}>
                    <AuthInputText
                        label="Email"
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />

                    <AuthInputPassword
                        label="Password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />

                    <AuthBtn
                        type="submit"
                        isLoading={isLoading}
                        loadingText="Logging in..."
                        buttonText="Login"
                        error={error}
                    />
                </form>
                <label>
                    <input
                        type="checkbox"
                        checked={remember}
                        onChange={(e) => setRemember(e.target.checked)}
                    />{" "}
                    Remember me
                </label>

                <div className={styles.registerLink}>
                    <p>
                        Don&apos;t have an account? <Link href={routePath.register.p}>Register here</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
