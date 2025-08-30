import router from "@/routes";

export const generateId = () => `${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 9)}`;

export const generateSubstituteUrl = (teacherId: string) => {
    return `${window.location.origin}${router.substitutePortal.p}/${teacherId}`;
};

export const generateTeacherUrl = (teacherId: string) => {
    return `${window.location.origin}${router.teacherPortal.p}/${teacherId}`;
};

export const generateSchoolUrl = (schoolId: string) => {
    return `${window.location.origin}${router.teacherSignIn.p}/${schoolId}`;
};