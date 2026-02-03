import React from "react";
import styles from "./SubmitBtn.module.css";
import Loading from "@/components/loading/Loading/Loading";

interface SubmitBtnProps {
    type: "submit" | "button" | "reset";
    onClick?: () => void;
    isLoading: boolean;
    buttonText: string;
    error?: string;
    disabled?: boolean;
    className?: string; // Optional className override
    width?: string;
}

const SubmitBtn: React.FC<SubmitBtnProps> = ({
    type = "submit",
    onClick,
    isLoading,
    buttonText,
    error,
    disabled = false,
    className = "",
    width,
}) => {
    return (
        <div className={styles.buttonContainer} style={width ? { width, margin: "0 auto" } : undefined}>
            <button
                type={type}
                className={`${styles.button} ${className}`}
                onClick={onClick}
                disabled={isLoading || disabled}
            >
                {isLoading ? <Loading size="S" /> : buttonText}
            </button>

            {error && <p className={styles.error}>{error}</p>}
        </div>
    );
};

export default SubmitBtn;
