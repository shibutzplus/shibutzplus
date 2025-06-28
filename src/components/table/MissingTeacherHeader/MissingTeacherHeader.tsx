import React from "react";
import styles from "./MissingTeacherHeader.module.css";
import DynamicInputSelect from "../../ui/InputSelect/DynamicInputSelect";

type MissingTeacherHeaderProps = {};

const MissingTeacherHeader: React.FC<MissingTeacherHeaderProps> = () => {
    return (
        <div className={styles.columnHeader}>
            <DynamicInputSelect options={[]} onChange={() => {}} placeholder="מורה" isSearchable />
        </div>
    );
};

export default MissingTeacherHeader;
