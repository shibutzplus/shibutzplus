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
    const isControlled = props.value !== undefined;
    // Check for empty string or null/undefined, but allow 0
    const isEmpty = isControlled ? (!props.value && props.value !== 0) : false;

    // Hide error if empty
    const showError = error && !isEmpty;

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
                    ${showError ? styles.inputError : ""} 
                    ${!hasBorder ? styles.noBorder : ""} 
                    ${className || ""}
                `}
                style={{ backgroundColor }}
                readOnly={readonly}
                {...props}
            />
            {showError && <p className={styles.errorText}>{error}</p>}
        </div>
    );
};

export default InputText;
