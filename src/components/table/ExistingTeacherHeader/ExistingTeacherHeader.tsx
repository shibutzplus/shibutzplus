import React from "react";
import styles from "./ExistingTeacherHeader.module.css";
import DynamicInputSelect from "../../ui/InputSelect/DynamicInputSelect";

type ExistingTeacherHeaderProps = {};

const ExistingTeacherHeader: React.FC<ExistingTeacherHeaderProps> = () => {
    return (
        <div className={styles.columnHeader}>
            <DynamicInputSelect options={[]} onChange={() => {}} placeholder="מורה" isSearchable />
        </div>
    );
};

export default ExistingTeacherHeader;
