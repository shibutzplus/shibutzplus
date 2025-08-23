import React from "react";
import styles from "./AddToSelectBtn.module.css";

type AddToSelectBtnProps = {
    onClick: () => void;
    label: string;
};

const AddToSelectBtn: React.FC<AddToSelectBtnProps> = ({ onClick, label }) => {
    return (
        <div className={styles.addBtn} onClick={() => onClick()}>
            בחירה והוספה של "{label}" לרשימה
        </div>
    );
};

export default AddToSelectBtn;
