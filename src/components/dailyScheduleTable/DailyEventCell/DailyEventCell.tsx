import React, { useState } from "react";
import styles from "./DailyEventCell.module.css";
import InputTextArea from "../../ui/InputTextArea/InputTextArea";
import messages from "@/resources/messages";
import { CellContext } from "@tanstack/react-table";
import { TeacherRow } from "@/models/types/table";
import { useDailyTableContext } from "@/context/DailyTableContext";
import { errorToast, successToast } from "@/lib/toast";

type DailyEventCellProps = { cell: CellContext<TeacherRow, unknown> };

const DailyEventCell: React.FC<DailyEventCellProps> = ({ cell }) => {
  const { mainDailyTable, addNewCell, updateCell, dailyDbRows, selectedDate } =
    useDailyTableContext();
  const [isLoading, setIsLoading] = useState(false);

  const columnId = cell?.column?.id;
  const hour = cell?.row?.original?.hour.toString();
  const eventData = mainDailyTable[selectedDate]?.[columnId]?.[hour]?.event;
  const headerData = mainDailyTable[selectedDate]?.[columnId]?.[hour]?.headerCol;

  const [info, setInfo] = useState<string>(eventData || "");

  const handleChange = async (value: string) => {
    if (!hour || !columnId || !selectedDate || !headerData) return;
    setIsLoading(true);
    setInfo(value);
    try {
      const cellData = mainDailyTable[selectedDate]?.[columnId]?.[hour];
      if (!cellData) return;

      let response;
      if (eventData) {
        const existing = dailyDbRows?.find(
          (e) => e.columnId === columnId && e.hour === Number(hour) && e.event === eventData,
        );
        if (existing) {
          response = await updateCell("event", cellData, columnId, existing.id, { event: info });
        }
      } else {
        response = await addNewCell("event", cellData, columnId, { event: info });
      }

      if (response) {
        successToast(eventData ? messages.dailySchedule.updateSuccess : messages.dailySchedule.createSuccess);
      } else {
        errorToast(eventData ? messages.dailySchedule.updateError : messages.dailySchedule.createError);
        setInfo("");
      }
    } catch {
      errorToast(eventData ? messages.dailySchedule.updateError : messages.dailySchedule.createError);
      setInfo("");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.cellContent}>
      <InputTextArea
        value={info}
        onChange={(e) => setInfo(e.target.value)}
        onBlur={(e) => handleChange(e.target.value)}
        placeholder="מה הולך לקרות בשעה זו?"
        disabled={isLoading}
        rows={1}
        autoGrow
      />
    </div>
  );
};

export default DailyEventCell;
