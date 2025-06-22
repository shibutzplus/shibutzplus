"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import InputText from "@/components/ui/InputText/InputText";
import InputPassword from "@/components/ui/InputPassword/InputPassword";
import SubmitBtn from "@/components/ui/SubmitBtn/SubmitBtn";
import styles from "./LoginForm.module.css";
import Link from "next/link";
import routePath from "../../routes";
import { EmailLink } from "@/models/constant";
import { SignInRequest } from "@/models/types/auth";
import signInWithCredentials from "@/app/actions/singInAction";

const LoginForm: React.FC = () => {
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

        const res = await signInWithCredentials({ email, password, remember } as SignInRequest);

        if (!res.success) {
            setError(res.message);
            setIsLoading(false);
            return;
        }

        router.push(routePath.dashboard.p);
        setIsLoading(false);
    };

    return (
        <div className={styles.formContainer}>
            <h1 className={styles.title}>כניסה למנהלים</h1>
            <p className={styles.subtitle}>הזינו את פרטי ההתחברות בשביל להכנס למערכת</p>

            <form className={styles.form} onSubmit={handleSubmit}>
                <div className={styles.inputGroup}>
                    <InputText
                        id="email"
                        type="email"
                        value={email}
                        label="כתובת אימייל"
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your.email@gmail.com"
                        required
                    />
                </div>

                <div className={styles.inputGroup}>
                    <InputPassword
                        id="password"
                        value={password}
                        label="סיסמה"
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="הזינו את הסיסמה"
                        required
                    />
                </div>

                <div className={styles.rememberContainer}>
                    <label className={styles.rememberLabel}>
                        <input
                            type="checkbox"
                            className={styles.rememberCheckbox}
                            checked={remember}
                            onChange={(e) => setRemember(e.target.checked)}
                        />
                        <span>זכור אותי לפעם הבאה</span>
                    </label>
                    <div className={styles.forgotPassword}>
                        <Link href={routePath.forget.p}>שכחת סיסמה?</Link>
                    </div>
                </div>

                <SubmitBtn
                    type="submit"
                    isLoading={isLoading}
                    loadingText="כניסה למערכת"
                    buttonText="כניסה"
                    error={error}
                />
            </form>

            <div className={styles.registerLink}>
                <p>
                    בעיה בהתחברות?{" "}
                    <Link href={EmailLink} className={styles.problemLink}>
                        צרו קשר עם שיבוץ+
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default LoginForm;
