interface IRoute {
    id: string;
    p: string;
    private: boolean;
    title: string;
}

const router: Record<string, IRoute> = {
    home: { id: "home", p: "/", private: false, title: "" },
    signIn: { id: "signIn", p: "/sign-in", private: false, title: "כניסה" },
    signUp: { id: "signUp", p: "/sign-up", private: false, title: "הרשמה" },
    forget: { id: "forget", p: "/forget", private: false, title: "שכחתי סיסמה" },
    about: { id: "about", p: "/about", private: false, title: "אודות" },
    dashboard: { id: "dashboard", p: "/dashboard", private: true, title: "מסך ראשי" },
    classes: { id: "classes", p: "/classes", private: true, title: "כיתות" },
    teachers: { id: "teachers", p: "/teachers", private: true, title: "מורים" },
    subjects: { id: "subjects", p: "/subjects", private: true, title: "מקצועות" },
    annualSchedule: { id: "annualSchedule", p: "/annual-schedule", private: true, title: "מערכת שנתית" },
    dailySchedule: { id: "dailySchedule", p: "/daily-schedule", private: true, title: "שיבוץ יומי" },
    connect: { id: "connect", p: "/connect", private: true, title: "צורו קשר" },
    profile: { id: "profile", p: "/profile", private: true, title: "המשתמש שלי" },
    history: { id: "history", p: "/history", private: true, title: "היסטוריה" },
    teacherAuth: { id: "teacherAuth", p: "/teacher-auth", private: false, title: "כניסה למורים" },
    teacherPortal: { id: "teacherPortal", p: "/teacher-portal", private: false, title: "פורטל המורה" },
};

export default router;
