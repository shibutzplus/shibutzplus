import React from "react";
import styles from "./EmptyTable.module.css";
import { FaList } from "react-icons/fa6";

type EmptyTableProps = {
    text: string;
};

const EmptyTable: React.FC<EmptyTableProps> = ({ text }) => {
    return (
        <tr className={styles.noTeachers}>
            <td>
                {text}
                <FaList size={24} />
            </td>
        </tr>
    );
};

export default EmptyTable;
