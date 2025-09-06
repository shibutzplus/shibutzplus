import React from "react";
import styles from "./TableList.module.css";

type TableListProps = {
    headThs: string[];
    children: React.ReactNode;
};

const TableList: React.FC<TableListProps> = ({ headThs, children }) => {
    return (
        <section className={styles.tableListSection}>
            <table className={styles.tableList}>
                <thead>
                    <tr>
                        {headThs.map((headTh) => (
                            <th key={headTh}>{headTh}</th>
                        ))}
                    </tr>
                </thead>
                {children}
            </table>
        </section>
    );
};

export default TableList;
