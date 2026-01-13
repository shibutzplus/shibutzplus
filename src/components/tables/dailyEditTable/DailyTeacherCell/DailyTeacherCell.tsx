import React, { useMemo, useState } from "react";
import { getDayNameByDateString } from "@/utils/time";
import styles from "./DailyTeacherCell.module.css";
import { useMainContext } from "@/context/MainContext";
import { useDailyTableContext } from "@/context/DailyTableContext";
import { ColumnType, ColumnTypeValues, DailyScheduleCell } from "@/models/types/dailySchedule";
import { EmptyValue } from "@/models/constant/daily";
import { getCellDisplayData } from "@/utils/dailyCellDisplay";
import DynamicInputGroupSelect from "@/components/ui/select/InputGroupSelect/DynamicInputGroupSelect";
import { errorToast } from "@/lib/toast";
import messages from "@/resources/messages";
import { sortDailyTeachers } from "@/utils/sort";

import EmptyCell from "@/components/ui/table/EmptyCell/EmptyCell";

type DailyTeacherCellProps = {
    columnId: string;
    cell: DailyScheduleCell;
    type: ColumnType;
};

const DailyTeacherCell: React.FC<DailyTeacherCellProps> = ({ columnId, cell, type }) => {
    const { teachers, classes, school } = useMainContext();
    const {
        mainDailyTable,
        mapAvailableTeachers,
        selectedDate,
        updateTeacherCell,
        clearTeacherCell,
        teacherClassMap,
    } = useDailyTableContext();

    const hour = cell?.hour;
    const classesData = cell?.classes;
    const subjectData = cell?.subject;
    const subTeacherData = cell?.subTeacher;
    const teacherText = cell?.event;
    const headerData = cell?.headerCol;

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [selectedSubTeacher, setSelectedSubTeacher] = useState<string>(
        subTeacherData?.name || teacherText || "",
    );

    const day = getDayNameByDateString(selectedDate);

    const isPublished = useMemo(() => school?.publishDates?.includes(selectedDate), [school, selectedDate]);

    // build classId -> activity map
    const classActivityById = useMemo(
        () => Object.fromEntries((classes || []).map((cls) => [cls.id, !!cls.activity])),
        [classes],
    );

    const classNameById = useMemo(
        () => Object.fromEntries((classes || []).map((cls) => [cls.id, cls.name])),
        [classes],
    );

    const sortedTeacherOptions = useMemo(
        () =>
            sortDailyTeachers(
                teachers || [],
                mapAvailableTeachers,
                mainDailyTable[selectedDate],
                day,
                Number(hour),
                teacherClassMap,
                classNameById,
                headerData?.headerTeacher?.id,
                classActivityById,
            ),
        [
            teachers,
            mapAvailableTeachers,
            mainDailyTable,
            selectedDate,
            mainDailyTable,
            selectedDate,
            hour,
            teacherClassMap,
            classNameById,
            headerData?.headerTeacher?.id,
            subTeacherData,
            teacherText,
            classActivityById,
        ],
    );

    const { text: displayText, isActivity } = useMemo(() => {
        return getCellDisplayData(
            {
                ...cell,
                classes: classesData,
                subject: subjectData,
            } as any, // casting as the types might slightly differ in strictness but structure is same
            headerData?.type ?? ColumnTypeValues.event
        );
    }, [cell, classesData, subjectData, headerData]);

    const getDisplayText = () => displayText;

    const handleTeacherChange = async (methodType: "update" | "create", value: string) => {
        if (!hour || !columnId || !selectedDate || !headerData) return;

        try {
            setIsLoading(true);
            const cellData = mainDailyTable[selectedDate]?.[columnId]?.[hour];
            if (!cellData) return;

            // Handle empty value - clear the selection
            if (value === EmptyValue || value === "") {
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

            const isTeacherOption = methodType === "update";
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
        } catch {
            errorToast(messages.dailySchedule.createError);
            setSelectedSubTeacher("");
        } finally {
            setIsLoading(false);
        }
    };

    const isMissingTeacher = headerData?.type === ColumnTypeValues.missingTeacher;
    const shouldHighlightMissing = isPublished && isMissingTeacher && !subTeacherData && !teacherText && !isActivity;

    return (
        <>
            <div style={{ width: "100%", height: "100%" }}>
                {(!classesData?.length && !subjectData && !subTeacherData && !teacherText) ? (
                    <div className={styles.cellContent}>
                        <EmptyCell />
                    </div>
                ) : (
                    <div className={styles.cellContent}>
                        <div className={styles.innerCellContent}>
                            <div
                                className={`${styles.classAndSubject} ${isActivity ? styles.activityText : ""
                                    }`}
                            >
                                {getDisplayText()}
                            </div>
                            <div className={styles.teacherSelect}>
                                <DynamicInputGroupSelect
                                    options={sortedTeacherOptions}
                                    value={selectedSubTeacher}
                                    onChange={(value: string) => handleTeacherChange("update", value)}
                                    placeholder="ממלא מקום"
                                    isSearchable
                                    isAllowAddNew
                                    isClearable
                                    isDisabled={isLoading}
                                    hasBorder
                                    backgroundColor="transparent"
                                    onCreate={(value: string) => handleTeacherChange("create", value)}
                                    menuWidth="220px"
                                    color={
                                        isActivity
                                            ? "var(--disabled-text-color)"
                                            : shouldHighlightMissing
                                                ? "var(--missing-teacher-text-color)"
                                                : undefined
                                    }
                                    fontWeight={shouldHighlightMissing ? "bold" : undefined}
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>

        </>
    );
};

export default DailyTeacherCell;
