import React from "react";
import styles from "./SelectLayout.module.css";

type SelectLayoutProps = {
    children: React.ReactNode;
    resolvedId: string;
    label?: string;
    error?: string;
};

const SelectLayout: React.FC<SelectLayoutProps> = ({ children, label, error, resolvedId }) => {
    return (
        <div className={styles.selectContainer}>
            {label ? (
                <label htmlFor={resolvedId} className={styles.label}>
                    {label}
                </label>
            ) : null}
            {children}
            {error ? <p className={styles.errorText}>{error}</p> : null}
        </div>
    );
};

export default SelectLayout;
