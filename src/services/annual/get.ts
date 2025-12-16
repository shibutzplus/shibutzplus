import { ClassType } from "@/models/types/classes";

export const getSelectedClass = (classes: ClassType[] | undefined, selectedClassId: string) => {
    return classes?.find((c) => c.id === selectedClassId);
};

export const getSelectedTeacher = (teachers: any[] | undefined, selectedTeacherId: string) => {
    return teachers?.find((t) => t.id === selectedTeacherId);
};
