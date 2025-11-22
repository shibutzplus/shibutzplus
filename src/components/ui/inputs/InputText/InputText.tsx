import React, { InputHTMLAttributes } from "react";
import styles from "./InputText.module.css";
import { InputBackgroundColor } from "@/style/root";

interface InputTextProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    backgroundColor?: string;
    readonly?: boolean;
    hasBorder?: boolean;
}

const InputText: React.FC<InputTextProps> = ({
    label,
    error,
    className,
    id,
    backgroundColor = InputBackgroundColor,
    readonly = false,
    hasBorder = true,
    ...props
}) => {
    return (
        <div className={styles.inputContainer}>
            {label && (
                <label htmlFor={id} className={styles.label}>
                    {label}
                </label>
            )}
            <input
                id={id}
                className={`
                    ${readonly ? styles.readonly : styles.input} 
                    ${error ? styles.inputError : ""} 
                    ${!hasBorder ? styles.noBorder : ""} 
                    ${className || ""}
                `}
                style={{ backgroundColor }}
                readOnly={readonly}
                {...props}
            />
            {error && <p className={styles.errorText}>{error}</p>}
        </div>
    );
};

export default InputText;
