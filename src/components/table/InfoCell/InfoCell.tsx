import React, { useState } from "react";
import styles from "./InfoCell.module.css";
import InputTextArea from "../../ui/InputTextArea/InputTextArea";

type InfoCellProps = {};

const InfoCell: React.FC<InfoCellProps> = () => {
    const [info, setInfo] = useState<string>("");

    return (
        <div className={styles.cellContent}>
            <InputTextArea
                value={info}
                onChange={(e) => setInfo(e.target.value)}
                placeholder="מה הולך לקרות בשעה זו?"
                rows={3}
            />
        </div>
    );
};

export default InfoCell;
