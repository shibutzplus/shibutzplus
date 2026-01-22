import React, { useState, useEffect, useRef } from "react";
import styles from "./DetailsListLayout.module.css";
import ListRowLoading from "@/components/loading/ListRowLoading/ListRowLoading";
import EmptyList from "@/components/empty/EmptyList/EmptyList";

type DetailsListLayoutProps<T> = {
    titles: [string, string];
    emptyText: string | React.ReactNode;
    details: T[] | undefined;
    headerAction?: React.ReactNode;
    children: React.ReactNode;
    footer?: React.ReactNode;
};

const DetailsListLayout = <T,>({
    titles,
    emptyText,
    details,
    headerAction,
    children,
    footer,
}: DetailsListLayoutProps<T>) => {
    const listRef = useRef<HTMLElement>(null);
    const [scrollbarWidth, setScrollbarWidth] = useState(0);

    useEffect(() => {
        const measureScrollbar = () => {
            if (listRef.current) {
                const width = listRef.current.offsetWidth - listRef.current.clientWidth;
                setScrollbarWidth(width);
            }
        };

        measureScrollbar();

        window.addEventListener("resize", measureScrollbar);
        const observer = new MutationObserver(measureScrollbar);
        if (listRef.current) {
            observer.observe(listRef.current, { childList: true, subtree: true });
        }

        return () => {
            window.removeEventListener("resize", measureScrollbar);
            observer.disconnect();
        };
    }, [details, children]);

    return (
        <main
            className={styles.container}
            style={{ "--scrollbar-width": `${scrollbarWidth}px` } as React.CSSProperties}
        >
            <header className={styles.header}>
                <div className={styles.headerRow}>
                    <div className={styles.headerName}>{titles[0]}</div>
                    <div className={styles.headerActions}>{titles[1]}</div>
                </div>
            </header>
            <div className={styles.addRowWrapper}>
                {headerAction}
            </div>
            <section className={styles.list} ref={listRef}>
                {details === undefined ? (
                    <ListRowLoading />
                ) : details?.length === 0 ? (
                    <EmptyList text={emptyText} />
                ) : (
                    children
                )}

            </section>
            {footer && <footer className={styles.footer}>{footer}</footer>}
        </main>
    );
};

export default DetailsListLayout;
