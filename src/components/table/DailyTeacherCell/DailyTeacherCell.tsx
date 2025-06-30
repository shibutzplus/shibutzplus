import React, { useState } from "react";
import styles from "./DailyTeacherCell.module.css";
import { useMainContext } from "@/context/MainContext";
import { useTable } from "@/context/TableContext";
import { CellContext } from "@tanstack/react-table";
import { TeacherRow } from "@/models/types/table";
import { createSelectOptions } from "@/utils/format";
import { useActions } from "@/context/ActionsContext";
import DynamicInputSelect from "@/components/ui/InputSelect/DynamicInputSelect";
import { addDailyScheduleAction } from "@/app/actions/addDailyScheduleAction";
import { DailyScheduleRequest } from "@/models/types/dailySchedule";
import { errorToast, successToast } from "@/lib/toast";
import messages from "@/resources/messages";
import { getDateString } from "@/utils/time";

type DailyTeacherCellProps = {
    cell?: CellContext<TeacherRow, unknown>;
    type: "existing" | "missing";
};

const DailyTeacherCell: React.FC<DailyTeacherCellProps> = ({ cell, type }) => {
    const { classes, subjects, teachers, school } = useMainContext();
    const { dailySchedule, selectedTeacherId } = useTable();
    const { selectedDayId } = useActions();
    const [isLoading, setIsLoading] = useState(false);
    const [selectedSubTeacher, setSelectedSubTeacher] = useState<string>("");

    // Get the current hour from the row data
    const hour = cell?.row?.original?.hour;

    // Get the column ID which contains the header ID
    const headerId = cell?.column?.id;

    // Get the schedule data for this cell
    const cellData = hour && headerId && dailySchedule[selectedDayId]?.[headerId]?.[String(hour)];

    // Find the class and subject based on their IDs
    const classData =
        cellData && "classId" in cellData && cellData.classId
            ? classes?.find((c) => c.id === cellData.classId)
            : undefined;
    const subjectData =
        cellData && "subjectId" in cellData && cellData.subjectId
            ? subjects?.find((s) => s.id === cellData.subjectId)
            : undefined;

    // Handle teacher selection in the cell
    const handleTeacherChange = async (teacherId: string) => {
        // Find the header teacher
        const headerTeacher = selectedTeacherId
            ? teachers?.find((t) => t.id === selectedTeacherId)
            : undefined;

        if (!school || !classData || !subjectData || !hour || !selectedDayId || !headerTeacher) {
            return;
        }

        setIsLoading(true);
        setSelectedSubTeacher(teacherId);

        try {
            // Check if there's already a schedule entry for this cell ---- not sure need
            const existingEntry = cellData && cellData.teacherId;

            if (!existingEntry) {
                // Create a new daily schedule entry
                const subTeacher = teachers?.find((t) => t.id === teacherId);
                if (!subTeacher) return;
                const scheduleData: DailyScheduleRequest = {
                    date: getDateString(Number(selectedDayId)),
                    hour: hour,
                    school: school,
                    class: classData,
                    subject: subjectData,
                    subTeacher: subTeacher,
                };

                // Set the appropriate teacher fields based on column type
                if (type === "existing") {
                    scheduleData.presentTeacher = headerTeacher;
                } else if (type === "missing") {
                    scheduleData.absentTeacher = headerTeacher;
                }
                const response = await addDailyScheduleAction(scheduleData);

                if (response.success) {
                    successToast(messages.dailySchedule.createSuccess);
                } else {
                    errorToast(response.message || messages.dailySchedule.createError);
                    setSelectedSubTeacher("");
                }
            }
        } catch (error) {
            console.error("Error adding daily schedule entry:", error);
            errorToast(messages.dailySchedule.createError);
            setSelectedSubTeacher("");
        } finally {
            setIsLoading(false);
        }
    };

    return selectedTeacherId ? (
        <div className={styles.cellContent}>
            {cellData && classData && subjectData ? (
                <>
                    <div className={styles.classAndSubject}>
                        {cellData && classData && subjectData
                            ? `${classData.name} | ${subjectData.name}`
                            : ""}
                    </div>
                    <div className={styles.teacherSelect}>
                        <DynamicInputSelect
                            options={createSelectOptions(teachers)}
                            value={selectedSubTeacher}
                            onChange={handleTeacherChange}
                            placeholder="בחר מורה"
                            isSearchable
                            hasBorder
                            isDisabled={isLoading}
                        />
                    </div>
                </>
            ) : (
                <div />
            )}
        </div>
    ) : (
        <div className={styles.cellContent}>
            <div className={styles.cellPlaceholder}>בחר מורה</div>
        </div>
    );
};

export default DailyTeacherCell;
