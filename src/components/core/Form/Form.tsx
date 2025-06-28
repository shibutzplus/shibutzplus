import React from "react";
import styles from "./Form.module.css";
import SubmitBtn from "@/components/ui/SubmitBtn/SubmitBtn";

type FormProps = {
    children: React.ReactNode[] | React.ReactNode;
    handleSubmit: (e: React.FormEvent) => void;
    isLoading: boolean;
    error?: string;
    btnText: string;
};

const Form: React.FC<FormProps> = ({ children, handleSubmit, isLoading, error, btnText }) => {
    return (
        <form onSubmit={handleSubmit} className={styles.addTeacherForm}>
            {children}

            <div className={styles.formActions}>
                <SubmitBtn type="submit" isLoading={isLoading} buttonText={btnText} error={error} />
            </div>
        </form>
    );
};

export default Form;
