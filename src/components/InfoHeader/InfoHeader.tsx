import React from "react";
import styles from "./InfoHeader.module.css";
import InputText from "../ui/InputText/InputText";

type InfoHeaderProps = {};

const InfoHeader: React.FC<InfoHeaderProps> = () => {
    return (
        <div className={styles.columnHeader}>
            <InputText placeholder="מידע" />
        </div>
    );
};

export default InfoHeader;
