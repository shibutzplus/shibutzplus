import React, { useState } from "react";
import styles from "./MissingTeacherCell.module.css";
import { TeacherType } from "@/models/types/teachers";
import DynamicInputSelect from "../../ui/InputSelect/DynamicInputSelect";
import { useMainContext } from "@/context/MainContext";

interface MissingTeacherCellProps {}

const MissingTeacherCell: React.FC<MissingTeacherCellProps> = () => {
    const { teachers } = useMainContext();
    const [selectedTeacher, setSelectedTeacher] = useState<TeacherType | undefined>();
    return (
        <div className={styles.cellContent}>
            <div className={styles.classAndSubject}>כיתה א1 | מקצוע מתמטיקה</div>
            <div className={styles.teacherSelect}>
                <DynamicInputSelect
                    options={(teachers || []).map((teacher) => ({
                        value: teacher.id,
                        label: teacher.name,
                    }))}
                    value={selectedTeacher?.id || ""}
                    onChange={(value: string) =>
                        setSelectedTeacher(teachers?.find((teacher) => teacher.id === value))
                    }
                    placeholder="בחר מורה"
                    isSearchable
                    hasBorder
                />
            </div>
        </div>
    );
};

export default MissingTeacherCell;
