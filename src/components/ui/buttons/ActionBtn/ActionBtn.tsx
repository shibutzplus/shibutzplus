import React from "react";
import styles from "./ActionBtn.module.css";
import Loading from "@/components/loading/Loading/Loading";

const ActionBtn: React.FC<{
    type?: string;
    Icon?: React.ReactNode;
    label?: React.ReactNode;
    tooltip?: string;
    style?: React.CSSProperties;
    func: () => void;
    isLoading?: boolean;
    isDisabled?: boolean;
    className?: string;
}> = ({ type, Icon, label, tooltip, style, func, isLoading = false, isDisabled = false, className }) => (
    <button
        key={type}
        style={style}
        className={`${styles.topButton} ${className || ''}`}
        title={tooltip || ""}
        onClick={func}
        disabled={isDisabled}
    >
        {isLoading ? <Loading size="S" /> : Icon ? Icon : null}
        {label && <span>{label}</span>}
    </button>
);

export default ActionBtn;
