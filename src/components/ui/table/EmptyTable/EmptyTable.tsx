import React from "react";
import styles from "./EmptyTable.module.css";
import Icons from "@/style/icons";

type EmptyTableProps = {
    text: string;
};

const EmptyTable: React.FC<EmptyTableProps> = ({ text }) => {
    return (
        <tr className={styles.noTeachers}>
            <td>
                {text}
                <Icons.emptyList size={24} />
            </td>
        </tr>
    );
};

export default EmptyTable;
