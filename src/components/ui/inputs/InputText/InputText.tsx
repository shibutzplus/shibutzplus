import React, { InputHTMLAttributes, useState, useRef } from "react";
import { useMobileSize } from "@/hooks/useMobileSize";
import { useMobileInput } from "@/context/MobileInputContext";
import styles from "./InputText.module.css";

interface InputTextProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    backgroundColor?: "#fdfbfb" | "transparent";
    readonly?: boolean;
    hasBorder?: boolean;
}

const InputText: React.FC<InputTextProps> = ({
    label,
    error,
    className,
    id,
    backgroundColor = "#fdfbfb",
    readonly = false,
    hasBorder = true,
    value,
    onChange,
    placeholder,
    ...props
}) => {
    const isMobile = useMobileSize();
    const { openOverlay } = useMobileInput();
    const [internalValue, setInternalValue] = useState(value || "");
    const inputRef = useRef<HTMLInputElement>(null);

    const handleMobileClick = () => {
        if (isMobile && !readonly) {
            const currentValue = value !== undefined ? String(value) : String(internalValue);
            openOverlay(
                currentValue,
                placeholder || "",
                (newValue: string) => {
                    if (onChange) {
                        // Create a synthetic event for compatibility
                        const syntheticEvent = {
                            target: { value: newValue },
                            currentTarget: { value: newValue },
                        } as React.ChangeEvent<HTMLInputElement>;
                        onChange(syntheticEvent);
                    } else {
                        setInternalValue(newValue);
                    }
                }
            );
        }
    };

    const handleDesktopChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!isMobile) {
            if (onChange) {
                onChange(e);
            } else {
                setInternalValue(e.target.value);
            }
        }
    };

    const displayValue = value !== undefined ? value : internalValue;

    return (
        <div className={styles.inputContainer}>
            {label && (
                <label htmlFor={id} className={styles.label}>
                    {label}
                </label>
            )}
            <input
                ref={inputRef}
                id={id}
                className={`
                    ${readonly ? styles.readonly : styles.input} 
                    ${error ? styles.inputError : ""} 
                    ${!hasBorder ? styles.noBorder : ""} 
                    ${isMobile && !readonly ? styles.mobileInput : ""} 
                    ${className || ""}
                `}
                style={{ backgroundColor }}
                readOnly={readonly || isMobile}
                value={displayValue}
                onChange={handleDesktopChange}
                onClick={handleMobileClick}
                placeholder={placeholder}
                {...props}
            />
            {error && <p className={styles.errorText}>{error}</p>}
        </div>
    );
};

export default InputText;
