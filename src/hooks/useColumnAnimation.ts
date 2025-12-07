import { useState, useEffect } from "react";
import { DailyScheduleCell } from "@/models/types/dailySchedule";

type ColumnData = {
    [hour: string]: DailyScheduleCell;
};

export const useColumnAnimation = (column: ColumnData) => {
    const [displayColumn, setDisplayColumn] = useState<ColumnData>(column);
    const [isFadingOut, setIsFadingOut] = useState(false);

    const colFirstObj = displayColumn["1"];
    const columnType = colFirstObj?.headerCol?.type || "event";

    useEffect(() => {
        // If column data changed
        if (JSON.stringify(column) !== JSON.stringify(displayColumn)) {
            if (columnType !== "event") {
                setIsFadingOut(true);

                const timer = setTimeout(() => {
                    setDisplayColumn(column);
                    setIsFadingOut(false);
                }, 300);
                return () => clearTimeout(timer);
            } else {
                setDisplayColumn(column);
            }
        }
    }, [column, displayColumn, columnType]);

    return { displayColumn, isFadingOut };
};
