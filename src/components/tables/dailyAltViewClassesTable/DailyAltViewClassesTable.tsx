import React from "react";
import { WeeklySchedule } from "@/models/types/annualSchedule";
import { SubjectType } from "@/models/types/subjects";
import { TeacherType } from "@/models/types/teachers";
import { ClassType } from "@/models/types/classes";
import DailyAltViewClassesCell from "./DailyAltViewClassesCell";
import styles from "./DailyAltViewClassesTable.module.css";

type DailyAltViewClassesTableProps = {
    schedule: WeeklySchedule;
    selectedDay: string;
    subjects: SubjectType[];
    teachers: TeacherType[];
    classes: ClassType[];
    fromHour: number;
    toHour: number;
};

const DailyAltViewClassesTable: React.FC<DailyAltViewClassesTableProps> = ({
    schedule,
    selectedDay,
    subjects,
    teachers,
    classes,
    fromHour,
    toHour,
}) => {
    const displayedClasses = (classes || []).filter((cls) => !cls.activity);

    return (
        <div className={styles.tableContainer}>
            <table className={styles.scheduleTable}>
                <thead>
                    <tr>
                        <th className={`${styles.headerCell} ${styles.hoursColumn}`}>
                            <div className={`${styles.headerInner} ${styles.hoursHeader}`}></div>
                        </th>
                        <th className={styles.emptyColSeparator}></th>
                        {displayedClasses.map((cls) => (
                            <th key={cls.id} className={`${styles.headerCell} ${styles.classColumn}`}>
                                <div className={styles.headerInner}>{cls.name}</div>
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className={styles.scheduleTableBody}>
                    {Array.from({ length: toHour - fromHour + 1 }, (_, i) => fromHour + i).map((hour) => (
                        <tr key={hour}>
                            <td className={styles.hoursColumn}>
                                <div className={styles.hourCell}>{hour}</div>
                            </td>
                            <td className={styles.emptyCell}></td>
                            {displayedClasses.map((cls) => (
                                <DailyAltViewClassesCell
                                    key={`${cls.id}-${hour}`}
                                    day={selectedDay}
                                    hour={hour}
                                    schedule={schedule}
                                    selectedClassId={cls.id}
                                    subjects={subjects}
                                    teachers={teachers}
                                    classes={classes}
                                />
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default DailyAltViewClassesTable;
