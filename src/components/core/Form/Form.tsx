import React from "react";
import styles from "./Form.module.css";
import SubmitBtn from "@/components/ui/SubmitBtn/SubmitBtn";

type FormProps = {
    children: React.ReactNode[] | React.ReactNode;
    handleSubmit: (e: React.FormEvent) => void;
    isLoading: boolean;
    error: string;
    success?: string;
    loadingText: string;
    btnText: string;
};

const Form: React.FC<FormProps> = ({
    children,
    handleSubmit,
    isLoading,
    error,
    success,
    loadingText,
    btnText,
}) => {
    return (
        <form onSubmit={handleSubmit} className={styles.addTeacherForm}>
            {children}

            <div className={styles.formActions}>
                {success && <div className={styles.successMessage}>{success}</div>}
                <SubmitBtn
                    type="submit"
                    isLoading={isLoading}
                    loadingText={loadingText}
                    buttonText={btnText}
                    error={error}
                />
            </div>
        </form>
    );
};

export default Form;
