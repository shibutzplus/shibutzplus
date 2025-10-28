import React from "react";
import styles from "./ListRowLoading.module.css";
import Loading from "@/components/loading/Loading/Loading";

const ListRowLoading: React.FC = () => {
    return (
        <tr className={styles.listRowLoading}>
            <td colSpan={2}>
                <div className={styles.loadingContainer}>
                    <Loading size="M" />
                </div>
            </td>
        </tr>
    );
};

export default ListRowLoading;
