import React, { useState } from "react";
import styles from "./InfoCell.module.css";
import InputTextArea from "../ui/InputTextArea/InputTextArea";

type InfoCellProps = {};

const InfoCell: React.FC<InfoCellProps> = () => {
    const [info, setInfo] = useState<string>("");

    return (
        <div className={styles.cellInputContainer}>
            <InputTextArea
                value={info}
                onChange={(e) => setInfo(e.target.value)}
                placeholder="רשום כאן את מה שמתרחש באירוע"
                className={styles.cellTextArea}
                rows={4}
            />
        </div>
    );
};

export default InfoCell;
