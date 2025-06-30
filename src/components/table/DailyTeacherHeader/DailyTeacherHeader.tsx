import React, { useState } from "react";
import styles from "./ExistingTeacherHeader.module.css";
import DynamicInputSelect from "../../ui/InputSelect/DynamicInputSelect";
import { useMainContext } from "@/context/MainContext";
import { useTable } from "@/context/TableContext";
import { getTeacherScheduleByDayAction } from "@/app/actions/getTeacherScheduleByDayAction";
import { TeacherType } from "@/models/types/teachers";
import { useActions } from "@/context/ActionsContext";

type DailyTeacherHeaderProps = {
    id?: string;
    type: "existing" | "missing";
};

const DailyTeacherHeader: React.FC<DailyTeacherHeaderProps> = ({ id, type }) => {
    const { teachers, school } = useMainContext();
    const { clearTeacherSchedule, setTeacherSchedule, setSelectedTeacher } = useTable();
    const { selectedDayId } = useActions();
    const [selectedTeacherState, setSelectedTeacherState] = useState<TeacherType | undefined>();
    const [isLoading, setIsLoading] = useState(false);

    const fetchTeacherSchedule = async (teacherId: string) => {
        if (!school?.id || !id) return;

        setIsLoading(true);
        try {
            // First, clear any existing data for this column
            clearTeacherSchedule(selectedDayId, id);
            
            const dayNumber = 1/////
            const response = await getTeacherScheduleByDayAction(school.id, dayNumber, teacherId);

            if (response.success && response.data) {
                // Transform the data for the context

                const scheduleData = response.data.map((item) => ({
                    hour: item.hour,
                    classId: item.class.id,
                    subjectId: item.subject.id,
                }));

                // Update the context with the teacher's schedule
                setTeacherSchedule(selectedDayId, id, scheduleData);

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

export default DailyTeacherHeader;
