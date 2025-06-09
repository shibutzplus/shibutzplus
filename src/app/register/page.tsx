"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./register.module.css";
import AuthInputText from "@/components/ui/AuthInputText/AuthInputText";
import AuthInputPassword from "@/components/ui/AuthInputPassword/AuthInputPassword";
import AuthSelect from "@/components/ui/AuthSelect/AuthSelect";
import { RegisterRequest, UserRole } from "@/models/types/auth";

export default function RegisterPage() {
    const router = useRouter();
    const [formData, setFormData] = useState<RegisterRequest>({
        name: "",
        email: "",
        password: "",
        role: "teacher" as UserRole,
    });
    const [error, setError] = useState<string>("");
    const [success, setSuccess] = useState<string>("");
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");
        setSuccess("");

        try {
            const response = await fetch("/api/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            let data;
            if (response.ok && response.headers.get("content-type")?.includes("application/json")) {
                data = await response.json();
            } else {
                console.error("Invalid response:", response.status, response.statusText);
            }

            if (!response.ok) {
                throw new Error(data?.message || "Registration failed");
            }

            setSuccess(data?.message || "Registration successful!");

            // Reset form
            setFormData({
                name: "",
                email: "",
                password: "",
                role: "teacher" as UserRole,
            });

            // Redirect to login after successful registration
            setTimeout(() => {
                router.push("/login");
            }, 2000);
        } catch (err: any) {
            setError(err.message || "Something went wrong");
        } finally {
            setIsLoading(false);
        }
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

                    <button type="submit" className={styles.button} disabled={isLoading}>
                        {isLoading ? "Registering..." : "Register"}
                    </button>

                    {error && <p className={styles.error}>{error}</p>}
                    {success && <p className={styles.success}>{success}</p>}
                </form>
            </div>
        </div>
    );
}
