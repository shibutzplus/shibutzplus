import React from "react";
import styles from "./EmptyTable.module.css";
import Icons from "@/style/icons";

type EmptyTableProps = {
    text: string;
};

const EmptyTable: React.FC<EmptyTableProps> = ({ text }) => {
    return (
        <div className={styles.noTeachers}>
            {text}
            <Icons.emptyList size={24} />
        </div>
    );
};

export default EmptyTable;
