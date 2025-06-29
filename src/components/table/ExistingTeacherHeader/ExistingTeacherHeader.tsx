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
    const { state, dispatch } = useTable();
    const [selectedTeacher, setSelectedTeacher] = useState<TeacherType | undefined>();
    const [isLoading, setIsLoading] = useState(false);

    const fetchTeacherSchedule = async (teacherId: string) => {
        if (!school?.id) return;

        setIsLoading(true);
        try {
            // First, clear any existing data for this column
            dispatch({
                type: "CLEAR_TEACHER_SCHEDULE",
                day: state.currentDay,
                headerId: id || "",
            });
            
            const dayNumber = getDayNumber();
            const response = await getTeacherScheduleByDayAction(school.id, dayNumber, teacherId);

            if (response.success && response.data && id) {
                // Transform the data for the context
                const scheduleData = response.data.map((item) => ({
                    hour: item.hour,
                    classId: item.class.id,
                    subjectId: item.subject.id,
                }));

                // Update the context with the teacher's schedule
                dispatch({
                    type: "SET_TEACHER_SCHEDULE",
                    day: state.currentDay,
                    headerId: id,
                    schedule: scheduleData,
                });

                // Set the selected teacher in the context
                dispatch({
                    type: "SET_SELECTED_TEACHER",
                    teacherId,
                });
            }
        } catch (error) {
            console.error("Error fetching teacher schedule:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleTeacherChange = (value: string) => {
        const teacher = teachers?.find((t) => t.id === value);
        setSelectedTeacher(teacher);

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
                value={selectedTeacher?.id || ""}
                onChange={handleTeacherChange}
                placeholder="מורה"
                isSearchable
                isDisabled={isLoading}
            />
        </div>
    );
};

export default ExistingTeacherHeader;
