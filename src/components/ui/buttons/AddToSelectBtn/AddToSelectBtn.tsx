import React from "react";
import styles from "./AddToSelectBtn.module.css";

type AddToSelectBtnProps = {
    onClick: () => void;
    text?: string;
};

const AddToSelectBtn: React.FC<AddToSelectBtnProps> = ({ onClick, text }) => {
    return (
        <div className={styles.addBtn} onClick={() => onClick()}>
            {text || "לחץ Enter להוספה"}
        </div>
    );
};

export default AddToSelectBtn;
