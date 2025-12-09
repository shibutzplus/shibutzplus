import { TeacherType } from "@/models/types/teachers";
import router from "@/routes";

export const generateId = () =>
    `${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 9)}`;

export const generateSchoolUrl = (schoolId: string, teacherId?: string) => {
    const baseUrl = `${window.location.origin}${router.teacherSignIn.p}/${schoolId}`;
    return teacherId ? `${baseUrl}?teacher_id=${teacherId}` : baseUrl;
};

export const greetingTeacher = (teacher: TeacherType | undefined) => {
    let greeting = "שלום";
    if (!teacher?.name) return greeting;
    const firstName = teacher.name.split(" ")[0];
    greeting = `${greeting} ${firstName}`;
    return greeting;
};
