import React from "react";
import styles from "./history.module.css";
import ReadOnlyDailyTable from "@/components/readOnlyDailyTable/ReadOnlyDailyTable/ReadOnlyDailyTable";

const HistoryLoading = () => {
    return (
        <div className={styles.content}>
            <div className={styles.tableWrapper}>
                <ReadOnlyDailyTable scheduleData={[]} isLoading={true} />
            </div>
        </div>
    );
};

export default HistoryLoading;
