import React, { useMemo, useState } from "react";
import { getDayNameByDateString } from "@/utils/time";
import styles from "./DailyTeacherCell.module.css";
import { useMainContext } from "@/context/MainContext";
import { useDailyTableContext } from "@/context/DailyTableContextP";
import {
    ActivityValues,
    ColumnType,
    DailyScheduleCell,
} from "@/models/types/dailySchedule";
import { EmptyValue } from "@/models/constant/daily";
import DynamicInputGroupSelect from "@/components/ui/select/InputGroupSelect/DynamicInputGroupSelect";
import { errorToast } from "@/lib/toast";
import messages from "@/resources/messages";
import { sortDailyTeachers } from "@/utils/sort";
import { activityOptionsMapValToLabel } from "@/resources/dailySelectActivities";
import EmptyCell from "@/components/ui/table/EmptyCell/EmptyCell";

type DailyTeacherCellProps = {
    columnId: string;
    cell: DailyScheduleCell;
    type: ColumnType;
};

const DailyTeacherCell: React.FC<DailyTeacherCellProps> = ({ columnId, cell, type }) => {
    const { teachers } = useMainContext();
    const {
        mainDailyTable,
        mapAvailableTeachers,
        selectedDate,
        updateTeacherCell,
        clearTeacherCell,
    } = useDailyTableContext();
    // const { teacherAtIndex, classNameById } = useAnnualTable();
    const [isLoading, setIsLoading] = useState(false);

    const hour = cell?.hour;
    const classData = cell?.class;
    const subjectData = cell?.subject;
    const subTeacherData = cell?.subTeacher;
    const teacherText = cell?.event;
    const headerData = cell?.headerCol;

    const [selectedSubTeacher, setSelectedSubTeacher] = useState<string>(
        subTeacherData?.name || teacherText || "",
    );

    const day = getDayNameByDateString(selectedDate);
    const sortedTeacherOptions = useMemo(
        () =>
            sortDailyTeachers(
                teachers || [],
                mapAvailableTeachers,
                mainDailyTable[selectedDate],
                day,
                Number(hour),
                {},
                {},
                headerData?.headerTeacher?.id,
            ),
        [
            teachers,
            mapAvailableTeachers,
            mainDailyTable,
            selectedDate,
            hour,
            {},
            {},
            headerData?.headerTeacher?.id,
        ],
    );

    const checkIfActivity = (value: string) =>
        Object.values(ActivityValues).some((option) => option === value);

    const handleTeacherChange = async (methodType: "update" | "create", value: string) => {
        if (!hour || !columnId || !selectedDate || !headerData) return;

        try {
            setIsLoading(true);
            const cellData = mainDailyTable[selectedDate]?.[columnId]?.[hour];
            if (!cellData) return;

            // Handle empty value - clear the selection
            if (value === EmptyValue) {
                setSelectedSubTeacher("");
                const existingDailyId = mainDailyTable[selectedDate]?.[columnId]?.[hour]?.DBid;
                if (existingDailyId) {
                    const response = await clearTeacherCell(
                        selectedDate,
                        type,
                        cellData,
                        columnId,
                        existingDailyId,
                    );
                    if (!response) throw new Error();
                }
                return;
            }

            const isTeacherOption = !checkIfActivity(value) && methodType === "update";
            const isActivityOption = checkIfActivity(value) && methodType === "update";
            const isEventOption = methodType === "create";

            let newSubTeacherData;
            if (isTeacherOption) {
                newSubTeacherData = teachers?.find((t) => t.id === value);
                if (!newSubTeacherData) return;
            }

            setSelectedSubTeacher(isTeacherOption ? newSubTeacherData?.name || "" : value);

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
                const response = await updateTeacherCell(
                    selectedDate,
                    type,
                    cellData,
                    columnId,
                    existingDailyId,
                    data,
                );
                if (!response) throw new Error();
            }
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
                            backgroundColor="transparent"
                            onChange={(value: string) => handleTeacherChange("update", value)}
                            onCreate={(value: string) => handleTeacherChange("create", value)}
                            placeholder="ממלא מקום"
                            isSearchable
                            isAllowAddNew
                            hasBorder
                            isDisabled={isLoading}
                        />
                    </div>
                </div>
            ) : (
                <EmptyCell />
            )}
        </div>
    );
};

export default DailyTeacherCell;
