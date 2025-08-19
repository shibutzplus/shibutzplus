import router from "@/routes";

export const generateId = () => `${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 9)}`;

export const generateTeacherUrl = (teacherId: string) => {
    return `${window.location.origin}${router.substituteAuth.p}/${teacherId}`;
};