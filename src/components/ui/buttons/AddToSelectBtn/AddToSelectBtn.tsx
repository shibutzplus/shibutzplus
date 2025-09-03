import React from "react";
import styles from "./AddToSelectBtn.module.css";

type AddToSelectBtnProps = {
    onClick: () => void;
    label: string;
};

const AddToSelectBtn: React.FC<AddToSelectBtnProps> = ({ onClick, label }) => {
    return (
        <div className={styles.addBtn} onClick={() => onClick()}>
            הוספה של "{label}"
        </div>
    );
};

export default AddToSelectBtn;
