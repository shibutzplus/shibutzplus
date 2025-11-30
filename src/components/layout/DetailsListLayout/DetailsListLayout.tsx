import React from "react";
import styles from "./DetailsListLayout.module.css";
import ListRowLoading from "@/components/loading/ListRowLoading/ListRowLoading";
import EmptyList from "@/components/empty/EmptyList/EmptyList";

type DetailsListLayoutProps<T> = {
    titles: [string, string];
    emptyText: string | React.ReactNode;
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
                <div className={styles.addRowWrapper}>
                    {children[0]}
                </div>
                <section className={styles.list}>
                    {details === undefined ? (
                        <ListRowLoading />
                    ) : details?.length === 0 ? (
                        <EmptyList text={emptyText} />
                    ) : (
                        children[1]
                    )}
                </section>
            </section>
        </main>
    );
};

export default DetailsListLayout;
