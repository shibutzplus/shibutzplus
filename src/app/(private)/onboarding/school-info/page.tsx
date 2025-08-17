"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "../onboarding.module.css";
import InputText from "@/components/ui/InputText/InputText";
import SubmitBtn from "@/components/ui/SubmitBtn/SubmitBtn";

interface UserData {
    name: string;
    gender: string;
    role: string;
}

const SchoolInfoPage: React.FC = () => {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [userData, setUserData] = useState<UserData | null>(null);

    // Form data
    const [schoolName, setSchoolName] = useState("");

    useEffect(() => {
        // Get user data from previous step
        const storedData = sessionStorage.getItem('onboarding_user_data');
        if (!storedData) {
            // Redirect back to user-info if no data found
            router.push("/onboarding/user-info");
            return;
        }
        
        try {
            const parsedData = JSON.parse(storedData) as UserData;
            setUserData(parsedData);
        } catch (error) {
            console.error("Error parsing user data:", error);
            router.push("/onboarding/user-info");
        }
    }, [router]);

    const handleBack = () => {
        router.push("/onboarding/user-info");
    };

    const handleSubmit = async () => {
        setError("");
        if (!schoolName.trim()) {
            setError("אנא הזן את שם בית הספר");
            return;
        }

        if (!userData) {
            setError("נתונים חסרים, אנא חזור לשלב הקודם");
            return;
        }

        setIsLoading(true);
        try {
            const { saveOnboardingAction } = await import("@/app/actions/POST/saveOnboardingAction");
            const response = await saveOnboardingAction({
                name: userData.name,
                gender: userData.gender,
                role: userData.role,
                schoolName,
            });

            if (response.success) {
                // Clear stored data
                sessionStorage.removeItem('onboarding_user_data');
                router.push("/dashboard");
            } else {
                setError(response.message);
            }
        } catch (error) {
            setError("אירעה שגיאה בשמירת הנתונים");
        } finally {
            setIsLoading(false);
        }
    };

    if (!userData) {
        return null; // Will redirect in useEffect
    }

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <div className={styles.header}>
                    <h1 className={styles.title}>איזה בית ספר?</h1>
                    <p className={styles.subtitle}>הזן את שם בית הספר שלך</p>
                </div>

                <div className={styles.form}>
                    <div className={styles.field}>
                        <label className={styles.label}>שם בית הספר</label>
                        <InputText
                            placeholder="הזן את שם בית הספר"
                            value={schoolName}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSchoolName(e.target.value)}
                        />
                    </div>

                    <div className={styles.buttonGroup}>
                        <SubmitBtn
                            type="button"
                            onClick={handleBack}
                            isLoading={false}
                            buttonText="חזור"
                            disabled={isLoading}
                        />
                        <SubmitBtn
                            type="button"
                            onClick={handleSubmit}
                            isLoading={isLoading}
                            buttonText={isLoading ? "שומר..." : "סיים"}
                            error={error}
                            disabled={isLoading}
                        />
                    </div>
                </div>

                <div className={styles.progress}>
                    <div className={styles.progressBar}>
                        <div 
                            className={styles.progressFill}
                            style={{ width: "100%" }}
                        />
                    </div>
                    <span className={styles.progressText}>שלב 2 מתוך 2</span>
                </div>
            </div>
        </div>
    );
};

export default SchoolInfoPage;
