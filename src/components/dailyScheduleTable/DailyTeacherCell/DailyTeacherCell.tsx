import React, { useMemo, useState } from "react";
import { getDayNameByDateString } from "@/utils/time";
import styles from "./DailyTeacherCell.module.css";
import { useMainContext } from "@/context/MainContext";
import { useDailyTableContext } from "@/context/DailyTableContext";
import { CellContext } from "@tanstack/react-table";
import { TeacherRow } from "@/models/types/table";
import DynamicInputGroupSelect from "@/components/ui/select/InputGroupSelect/DynamicInputGroupSelect";
import { ColumnType, ActivityValues } from "@/models/types/dailySchedule";
import { errorToast } from "@/lib/toast";
import messages from "@/resources/messages";
import { sortDailyTeachers } from "@/utils/sort";
import { activityOptionsMapValToLabel } from "@/resources/dailySelectActivities";

type DailyTeacherCellProps = {
    cell: CellContext<TeacherRow, unknown>;
    type: Exclude<ColumnType, "event">;
};

const DailyTeacherCell: React.FC<DailyTeacherCellProps> = ({ cell, type }) => {
    const { teachers, classes } = useMainContext();
    const {
        mainDailyTable,
        mapAvailableTeachers,
        addNewCell,
        selectedDate,
        updateCell,
        addNewCellText,
    } = useDailyTableContext();
    const [isLoading, setIsLoading] = useState(false);

    // Get data from the row data
    const columnId = cell?.column?.id;
    const hour = cell?.row?.original?.hour.toString();
    const classData = mainDailyTable[selectedDate]?.[columnId]?.[hour]?.class;
    const subjectData = mainDailyTable[selectedDate]?.[columnId]?.[hour]?.subject;
    const subTeacherData = mainDailyTable[selectedDate]?.[columnId]?.[hour]?.subTeacher;
    const teacherText = mainDailyTable[selectedDate]?.[columnId]?.[hour]?.event;
    const headerData = mainDailyTable[selectedDate]?.[columnId]?.[hour]?.headerCol;

    const [selectedSubTeacher, setSelectedSubTeacher] = useState<string>(
        subTeacherData?.id || teacherText || "",
    );

    const selectedClassId = classData?.id || "";
    const day = getDayNameByDateString(selectedDate);
    const sortedTeacherOptions = useMemo(
        () => sortDailyTeachers(teachers || [], mapAvailableTeachers, day, Number(hour)),
        [teachers, classes, selectedClassId, day, hour],
    );

    const checkIfActivity = (value: string) =>
        Object.values(ActivityValues).some((option) => option === value);

    const handleTeacherChange = async (methodType: "update" | "create", value: string) => {
        if (!hour || !columnId || !selectedDate || !headerData) return;
        
        try {
            setIsLoading(true);
            const cellData = mainDailyTable[selectedDate]?.[columnId]?.[hour];
            if (!cellData) return;
            setSelectedSubTeacher(value);
            const isTeacherOption = !checkIfActivity(value) && methodType === "update";
            const isActivityOption = checkIfActivity(value) && methodType === "update";
            const isEventOption = methodType === "create";

            let newSubTeacherData;
            if (isTeacherOption) {
                newSubTeacherData = teachers?.find((t) => t.id === value);
                if (!newSubTeacherData) return;
            }

            let response;
            const isUpdate = subTeacherData || teacherText;
            if (isUpdate) {
                const existingDailyId = mainDailyTable[selectedDate]?.[columnId]?.[hour]?.DBid;
                if (existingDailyId) {
                    let data = {};
                    if (isTeacherOption) {
                        data = { subTeacher: newSubTeacherData };
                    } else if (isEventOption) {
                        data = { event: value.trim() };
                    } else if (isActivityOption) {
                        data = { event: activityOptionsMapValToLabel(value) };
                    }
                    response = await updateCell(type, cellData, columnId, existingDailyId, data);
                }
            } else {
                if (isTeacherOption) {
                    response = await addNewCell(type, cellData, columnId, {
                        subTeacher: newSubTeacherData,
                    });
                } else if (isEventOption) {
                    response = await addNewCellText(type, cellData, columnId, value.trim());
                } else if (isActivityOption) {
                    response = await addNewCellText(type, cellData, columnId, activityOptionsMapValToLabel(value) || "");
                }
            }
            if (!response) throw new Error();
        } catch (error) {
            errorToast(messages.dailySchedule.createError);
            setSelectedSubTeacher("");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.cellContent}>
            {classData && subjectData ? (
                <div className={styles.innerCellContent}>
                    <div className={styles.classAndSubject}>
                        {classData.name} | {subjectData.name}
                    </div>
                    <div className={styles.teacherSelect}>
                        <DynamicInputGroupSelect
                            options={sortedTeacherOptions}
                            value={selectedSubTeacher}
                            onChange={(value: string) => handleTeacherChange("update", value)}
                            onCreate={(value: string) => handleTeacherChange("create", value)}
                            placeholder="בחירת מורה מחליף"
                            isSearchable
                            isAllowAddNew
                            hasBorder
                            isDisabled={isLoading}
                        />
                    </div>
                </div>
            ) : (
                <div className={styles.emptyCell} />
            )}
        </div>
    );
};

export default DailyTeacherCell;


// TODO: option to opacity other options
// style={{ opacity: selectedSubTeacher === "trip" ? 0.3 : 1 }}