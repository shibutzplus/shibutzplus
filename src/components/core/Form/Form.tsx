import React from "react";
import styles from "./Form.module.css";

type FormProps = {
    children: React.ReactNode[] | React.ReactNode;
    handleSubmit: (e: React.FormEvent) => void;
    isLoading: boolean;
    error?: string;
};

const Form: React.FC<FormProps> = ({ children, handleSubmit, isLoading, error }) => {
    return (
        <form onSubmit={handleSubmit} className={styles.addTeacherForm}>
            {children}
        </form>
    );
};

export default Form;
