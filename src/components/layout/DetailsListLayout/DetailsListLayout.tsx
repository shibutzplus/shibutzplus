import React from "react";
import styles from "./DetailsListLayout.module.css";
import { TeacherType } from "@/models/types/teachers";
import ListRowLoading from "@/components/loading/ListRowLoading/ListRowLoading";
import EmptyTable from "@/components/ui/table/EmptyTable/EmptyTable";

type DetailsListLayoutProps<T> = {
    titles: [string, string];
    emptyText: string;
    details: T[] | undefined;
    children: React.ReactNode[];
};

const DetailsListLayout = <T,>({
    titles,
    emptyText,
    details,
    children,
}: DetailsListLayoutProps<T>) => {
    return (
        <main className={styles.container}>
            <header className={styles.header}>
                {titles.map((title, index) => (
                    <h2 key={index}>{title}</h2>
                ))}
            </header>
            <section className={styles.listSection}>
                {children[0]}
                <section className={styles.list}>
                    {details === undefined ? (
                        <ListRowLoading />
                    ) : details?.length === 0 ? (
                        <EmptyTable text={emptyText} />
                    ) : (
                        children[1]
                    )}
                </section>
            </section>
        </main>
    );
};

export default DetailsListLayout;
