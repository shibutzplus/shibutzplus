"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AuthInputText from "@/components/ui/AuthInputText/AuthInputText";
import AuthInputPassword from "@/components/ui/AuthInputPassword/AuthInputPassword";
import AuthSelect from "@/components/ui/AuthSelect/AuthSelect";
import AuthBtn from "@/components/ui/AuthBtn/AuthBtn";
import styles from "./register.module.css";
import routePath from "../../routes";

const RegisterPage: React.FC = () => {
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
            setError("Server error; check console.");
            return;
        }

        if (!res.ok) {
            setError(data.error || "Registration failed");
            return;
        }
        setIsLoading(false);
        router.push(routePath.login.p);
    };

    return (
        <div className={styles.container}>
            <div className={styles.formContainer}>
                <h1 className={styles.title}>Register</h1>
                <form className={styles.form} onSubmit={handleSubmit}>
                    <AuthInputText
                        label="Name"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                    />

                    <AuthInputText
                        label="Email"
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />

                    <AuthInputPassword
                        label="Password"
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />

                    <AuthSelect
                        label="Role"
                        id="role"
                        name="role"
                        value={formData.role}
                        onChange={handleChange}
                        required
                        options={[
                            { value: "principal", label: "Principal" },
                            { value: "deputy principal", label: "Deputy Principal" },
                            { value: "teacher", label: "Teacher" },
                            { value: "substitute teacher", label: "Substitute Teacher" },
                        ]}
                    />

                    <AuthBtn
                        type="submit"
                        isLoading={isLoading}
                        loadingText="Registering..."
                        buttonText="Register"
                        error={error}
                    />
                </form>
            </div>
        </div>
    );
};

export default RegisterPage;
