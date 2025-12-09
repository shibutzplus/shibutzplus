import React from "react";
import styles from "./ListRowLoading.module.css";
import Loading from "@/components/loading/Loading/Loading";

const ListRowLoading: React.FC = () => {
    return (
        <div className={styles.listRowLoading}>
            <div>
                <div className={styles.loadingContainer}>
                    <Loading size="M" />
                </div>
            </div>
        </div>
    );
};

export default ListRowLoading;
