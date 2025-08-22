"use client";

import React from "react";
import styles from "./AnnualCell.module.css";
import DynamicInputSelect from "@/components/ui/InputSelect/DynamicInputSelect";
import { createSelectOptions, sortByHebrewName } from "@/utils/format";
import { SubjectType } from "@/models/types/subjects";
import { TeacherType } from "@/models/types/teachers";
import { WeeklySchedule } from "@/models/types/annualSchedule";
import { sortTeachersForSchedule } from "@/utils/teachers";
import DynamicInputGroupSelect from "@/components/ui/InputGroupSelect/DynamicInputGroupSelect";
import { ClassType } from "@/models/types/classes";
import InputGroupSelect from "@/components/ui/InputGroupSelect/InputGroupSelect";

type AnnualCellProps = {
    day: string;
    hour: number;
    schedule: WeeklySchedule;
    selectedClassId: string;
    subjects: SubjectType[];
    teachers: TeacherType[];
    classes: ClassType[];
    onSubjectChange: (day: string, hour: number, value: string) => Promise<void>;
    onTeacherChange: (day: string, hour: number, value: string) => Promise<void>;
    onCreateSubject: (day: string, hour: number, value: string) => Promise<string | undefined>;
    onCreateTeacher: (day: string, hour: number, value: string) => Promise<string | undefined>;
};

const AnnualCell: React.FC<AnnualCellProps> = ({
    day,
    hour,
    schedule,
    selectedClassId,
    subjects,
    teachers,
    classes,
    onSubjectChange,
    onTeacherChange,
    onCreateSubject,
    onCreateTeacher,
}) => {
    return (
        <td className={styles.scheduleCell}>
            <div className={styles.cellContent}>
                <DynamicInputSelect
                    placeholder="מקצוע"
                    options={createSelectOptions<SubjectType>(
                        sortByHebrewName(subjects || [])
                    )}
                    value={
                        schedule[selectedClassId]?.[day]?.[hour]?.subject || ""
                    }
                    onChange={(value: string) =>
                        onSubjectChange(day, hour, value)
                    }
                    onCreate={(value: string) =>
                        onCreateSubject(day, hour, value)
                    }
                    isSearchable
                    allowAddNew
                />
                {/* Grouped teacher select */}
                <DynamicInputGroupSelect
                    placeholder="מורה"
                    options={sortTeachersForSchedule(
                        teachers || [],
                        classes || [],
                        schedule,
                        selectedClassId,
                        day,
                        hour
                    )}
                    value={
                        schedule[selectedClassId]?.[day]?.[hour]?.teacher || ""
                    }
                    onChange={(value: string) =>
                        onTeacherChange(day, hour, value)
                    }
                    isSearchable
                />
            </div>
        </td>
    );
};

export default AnnualCell;
