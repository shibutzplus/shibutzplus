"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "../onboarding.module.css";
import InputText from "@/components/ui/InputText/InputText";
import SubmitBtn from "@/components/ui/SubmitBtn/SubmitBtn";

const UserInfoPage: React.FC = () => {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    // Form data
    const [name, setName] = useState("");
    const [gender, setGender] = useState("");
    const [role, setRole] = useState("");

    const genderOptions = [
        { value: "male", label: "זכר" },
        { value: "female", label: "נקבה" },
    ];

    const roleOptions = [
        { value: "admin", label: "מנהל/ת" },
        { value: "teacher", label: "מורה" },
    ];

    const handleNext = () => {
        setError("");
        if (!name.trim() || !gender || !role) {
            setError("אנא מלא את כל השדות");
            return;
        }

        // Store data in sessionStorage for next page
        sessionStorage.setItem('onboarding_user_data', JSON.stringify({
            name,
            gender,
            role
        }));

        router.push("/onboarding/school-info");
    };

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <div className={styles.header}>
                    <h1 className={styles.title}>ברוכים הבאים לשיבוץ +</h1>
                    <p className={styles.subtitle}>בואו נכיר אותך קצת יותר</p>
                </div>

                <div className={styles.form}>
                    <div className={styles.field}>
                        <label className={styles.label}>שם מלא</label>
                        <InputText
                            placeholder="הזן את שמך המלא"
                            value={name}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                        />
                    </div>

                    <div className={styles.field}>
                        <label className={styles.label}>מגדר</label>
                        <select
                            className={styles.select}
                            value={gender}
                            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setGender(e.target.value)}
                        >
                            <option value="">בחר מגדר</option>
                            {genderOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className={styles.field}>
                        <label className={styles.label}>תפקיד</label>
                        <select
                            className={styles.select}
                            value={role}
                            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setRole(e.target.value)}
                        >
                            <option value="">בחר תפקיד</option>
                            {roleOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <SubmitBtn
                        type="button"
                        onClick={handleNext}
                        isLoading={isLoading}
                        buttonText="המשך"
                        error={error}
                        disabled={isLoading}
                    />
                </div>

                <div className={styles.progress}>
                    <div className={styles.progressBar}>
                        <div 
                            className={styles.progressFill}
                            style={{ width: "50%" }}
                        />
                    </div>
                    <span className={styles.progressText}>שלב 1 מתוך 2</span>
                </div>
            </div>
        </div>
    );
};

export default UserInfoPage;
