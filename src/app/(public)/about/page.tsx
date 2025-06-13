import React from "react";
import styles from "./about.module.css";
import Table from "@/components/table/Table/Table";
import TableActions from "@/components/TableActions/TableActions";
import { TableContextProvider } from "@/context/TableContext";

const AboutPage: React.FC = () => {
    return (
        <main className={styles.container}>
            <section className={styles.tableWrapper}>
                <TableContextProvider>
                    <TableActions />
                    <Table />
                </TableContextProvider>
            </section>
        </main>
    );
};

export default AboutPage;
