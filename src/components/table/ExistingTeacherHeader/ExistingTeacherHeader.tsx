import React, { useState } from "react";
import styles from "./ExistingTeacherHeader.module.css";
import DynamicInputSelect from "../../ui/InputSelect/DynamicInputSelect";
import { useMainContext } from "@/context/MainContext";
import { useTable } from "@/context/TableContext";
import { getTeacherScheduleByDayAction } from "@/app/actions/getTeacherScheduleByDayAction";
import { TeacherType } from "@/models/types/teachers";
import { getDayNumber } from "@/utils/time";

type ExistingTeacherHeaderProps = {
    id?: string;
};

const ExistingTeacherHeader: React.FC<ExistingTeacherHeaderProps> = ({ id }) => {
    const { teachers, school } = useMainContext();
    const { currentDay, clearTeacherSchedule, setTeacherSchedule, setSelectedTeacher } = useTable();
    const [selectedTeacherState, setSelectedTeacherState] = useState<TeacherType | undefined>();
    const [isLoading, setIsLoading] = useState(false);

    const fetchTeacherSchedule = async (teacherId: string) => {
        if (!school?.id || !id) return;

        setIsLoading(true);
        try {
            // First, clear any existing data for this column
            clearTeacherSchedule(currentDay, id);
            
            const dayNumber = getDayNumber();
            const response = await getTeacherScheduleByDayAction(school.id, dayNumber, teacherId);
console.log("1", response)
            if (response.success && response.data) {
                // Transform the data for the context
                console.log("2")
                const scheduleData = response.data.map((item) => ({
                    hour: item.hour,
                    classId: item.class.id,
                    subjectId: item.subject.id,
                }));

                // Update the context with the teacher's schedule
                setTeacherSchedule(currentDay, id, scheduleData);

                // Set the selected teacher in the context
                setSelectedTeacher(teacherId);
            }
        } catch (error) {
            console.error("Error fetching teacher schedule:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleTeacherChange = (value: string) => {
        const teacher = teachers?.find((t) => t.id === value);
        setSelectedTeacherState(teacher);

        if (value) {
            fetchTeacherSchedule(value);
        }
    };

    return (
        <div className={styles.columnHeader}>
            <DynamicInputSelect
                options={(teachers || []).map((teacher) => ({
                    value: teacher.id,
                    label: teacher.name,
                }))}
                value={selectedTeacherState?.id || ""}
                onChange={handleTeacherChange}
                backgroundColor="transparent"
                placeholder="מורה"
                isSearchable
                isDisabled={isLoading}
                hasBorder
            />
        </div>
    );
};

export default ExistingTeacherHeader;
