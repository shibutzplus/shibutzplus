import React from "react";
import styles from "./ActionBtn.module.css";

const ActionBtn: React.FC<{
    type?: string;
    Icon?: React.ReactNode;
    label: string;
    style: React.CSSProperties;
    func: () => void;
    isDisabled?: boolean;
}> = ({ type, Icon, label, style, func, isDisabled = false }) => (
    <button key={type} style={style} className={styles.topButton} title={label} onClick={func} disabled={isDisabled}>
        {Icon ? Icon : null}
        <span>{label}</span>
    </button>
);

export default ActionBtn;

