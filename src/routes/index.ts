interface IRoute {
    id: string;
    p: string;
    private: boolean;
    title: string;
}

const router: Record<string, IRoute> = {
    home: { id: "home", p: "/", private: false, title: "" },
    signIn: { id: "signIn", p: "/sign-in", private: false, title: "כניסה" },
    signUp: { id: "signUp", p: "/sign-up", private: true, title: "בית ספר/מנהל חדש" },
    schoolSelect: {
        id: "schoolSelect",
        p: "/school-select",
        private: false,
        title: "בחירת בית ספר",
    },
    classes: { id: "classes", p: "/classes", private: true, title: "כיתות" },
    groups: { id: "groups", p: "/groups", private: true, title: "קבוצות עבודה" },
    teachers: { id: "teachers", p: "/teachers", private: true, title: "מורים" },
    subjects: { id: "subjects", p: "/subjects", private: true, title: "מקצועות" },
    substitute: { id: "substitute", p: "/substitute", private: true, title: "מורים מילוי מקום" },
    annualByClass: {
        id: "annualByClass",
        p: "/annual-class",
        private: true,
        title: "מערכת שנתית לפי כיתה",
    },
    annualByTeacher: {
        id: "annualByTeacher",
        p: "/annual-teacher",
        private: true,
        title: "מערכת שנתית לפי מורה",
    },
    annualView: { id: "annualView", p: "/annual-view", private: true, title: "מערכת שנתית" },
    dailySchedule: {
        id: "dailySchedule",
        p: "/daily-schedule",
        private: true,
        title: "שיבוץ יומי",
    },
    profile: { id: "profile", p: "/profile", private: true, title: "המשתמש שלי" },
    history: { id: "history", p: "/history", private: true, title: " היסטוריה מערכות" },
    teacherSignIn: {
        id: "teacherSignIn",
        p: "/teacher-sign-in",
        private: false,
        title: "כניסה למורים",
    },
    teacherMaterialPortal: {
        id: "teacherMaterialPortal",
        p: "/teacher-material",
        private: false,
        title: "המערכת שלי",
    },
    scheduleViewPortal: {
        id: "scheduleViewPortal",
        p: "/schedule-view",
        private: false,
        title: "מערכת יומית",
    },
    faqManager: { id: "faqManager", p: "/faqManager", private: true, title: "שאלות נפוצות" },
    faqTeachers: { id: "faqTeachers", p: "/faqTeachers", private: true, title: "שאלות נפוצות" },
    adminSignIn: { id: "adminSignIn", p: "/admin/sign-in", private: false, title: "כניסת מנהל" },
    fullScheduleView: { id: "fullScheduleView", p: "/schedule-full", private: false, title: "מערכת במסך מלא", },
};

export default router;
