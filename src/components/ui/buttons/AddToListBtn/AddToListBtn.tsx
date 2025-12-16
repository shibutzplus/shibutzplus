import React from "react";
import styles from "./AddToListBtn.module.css";
import Loading from "@/components/loading/Loading/Loading";

interface AddToListBtnProps {
    text: string;
    onClick?: (e: React.MouseEvent) => void;
    isLoading: boolean;
    Icon?: React.ReactNode;
    className?: string;
    style?: React.CSSProperties;
}

const AddToListBtn: React.FC<AddToListBtnProps> = ({
    text,
    onClick,
    isLoading,
    Icon,
    className,
    style,
}) => {
    return (
        <button
            onClick={onClick}
            disabled={isLoading}
            aria-label={text}
            className={`${styles.btn}${className ? " " + className : ""}`}
            style={style}
        >
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

export default AddToListBtn;
