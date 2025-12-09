import React from "react";
import styles from "./ActionBtn.module.css";
import Loading from "@/components/loading/Loading/Loading";

const ActionBtn: React.FC<{
    type?: string;
    Icon?: React.ReactNode;
    label?: string;
    tooltip?: string;
    style: React.CSSProperties;
    func: () => void;
    isLoading?: boolean;
    isDisabled?: boolean;
}> = ({ type, Icon, label, tooltip, style, func, isLoading = false, isDisabled = false }) => (
    <button
        key={type}
        style={style}
        className={styles.topButton}
        title={tooltip || ""}
        onClick={func}
        disabled={isDisabled}
    >
        {isLoading ? <Loading size="S" /> : Icon ? Icon : null}
        {label && <span>{label}</span>}
    </button>
);

export default ActionBtn;
