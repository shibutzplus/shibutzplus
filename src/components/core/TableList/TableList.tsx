import React from "react";
import styles from "./TableList.module.css";

type TableListProps = {
    headThs: string[];
    children: React.ReactNode;
    height?: string;
};

const TableList: React.FC<TableListProps> = ({ headThs, children, height = "90vh" }) => {
    return (
        <section className={styles.tableListSection} style={{ height }}>
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
