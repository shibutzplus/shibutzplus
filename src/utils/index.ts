import router from "@/routes";

export const generateId = () => `${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 9)}`;

// TODO: not in use
export const generateTeacherUrl = (schoolId: string, teacherId?: string) => {
    return `${window.location.origin}${router.teacherPortal.p}/${schoolId}/${teacherId}`;
};

export const generateSchoolUrl = (schoolId: string, teacherId?: string) => {
    const baseUrl = `${window.location.origin}${router.teacherSignIn.p}/${schoolId}`;
    return teacherId ? `${baseUrl}?teacher_id=${teacherId}` : baseUrl;
};