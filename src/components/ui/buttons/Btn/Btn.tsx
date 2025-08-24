import React from "react";
import styles from "./Btn.module.css";
import Loading from "@/components/core/Loading/Loading";

interface BtnProps {
    text: string;
    onClick?: (e: React.MouseEvent) => void;
    isLoading: boolean;
    Icon?: React.ReactNode;
}

const Btn: React.FC<BtnProps> = ({ text, onClick, isLoading, Icon }) => {
    return (
        <button onClick={onClick} disabled={isLoading} aria-label={text} className={styles.btn}>
            {isLoading ? (
                <span className={styles.btnText}>
                    <Loading size="S" />
                    <span>{text}</span>
                </span>
            ) : (
                <span className={styles.btnText}>
                    {Icon ? Icon : null}
                    <span>{text}</span>
                </span>
            )}
        </button>
    );
};

export default Btn;
