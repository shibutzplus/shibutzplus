"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AuthInputText from "@/components/ui/AuthInputText/AuthInputText";
import AuthInputPassword from "@/components/ui/AuthInputPassword/AuthInputPassword";
import AuthSelect from "@/components/ui/AuthSelect/AuthSelect";
import AuthBtn from "@/components/ui/AuthBtn/AuthBtn";
import styles from "./register.module.css";
import routePath from "../../../routes";
import errMsg from "@/resources/errorsMsg";
import { NextPage } from "next";

const RegisterPage: NextPage = () => {
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        role: "teacher",
    });
    const [error, setError] = useState<string>("");
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        const res = await fetch("/api/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData),
        });

        const text = await res.text();
        let data: { message?: string; error?: string };

        try {
            data = JSON.parse(text);
        } catch {
            console.error("Non-JSON /api/register response:", text);
            setError(errMsg.auth.serverError);
            return;
        }

        if (!res.ok) {
            setError(errMsg.auth.register.failed);
            return;
        }
        setIsLoading(false);
        router.push(routePath.login.p);
    };

    return (
        <div className={styles.container}>
            <div className={styles.formContainer}>
                <h1 className={styles.title}>הרשמה</h1>
                <form className={styles.form} onSubmit={handleSubmit}>
                    <AuthInputText
                        label="שם מלא"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                    />

                    <AuthInputText
                        label="כתובת אימייל"
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />

                    <AuthInputPassword
                        label="סיסמה"
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />

                    <AuthSelect
                        label="תפקיד"
                        id="role"
                        name="role"
                        value={formData.role}
                        onChange={handleChange}
                        required
                        options={[
                            { value: "principal", label: "מנהל/ת" },
                            { value: "deputy principal", label: "סגן/ית" },
                            { value: "teacher", label: "מורה" },
                        ]}
                    />

                    <AuthBtn
                        type="submit"
                        isLoading={isLoading}
                        loadingText="הירשם..."
                        buttonText="הירשם"
                        error={error}
                    />
                </form>
            </div>
        </div>
    );
};

export default RegisterPage;
