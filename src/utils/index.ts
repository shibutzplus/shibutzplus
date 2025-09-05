import router from "@/routes";

export const generateId = () => `${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 9)}`;

export const generateSchoolUrl = (schoolId: string, teacherId?: string) => {
    const baseUrl = `${window.location.origin}${router.teacherSignIn.p}/${schoolId}`;
    return teacherId ? `${baseUrl}?teacher_id=${teacherId}` : baseUrl;
};