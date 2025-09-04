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
    classes: { id: "classes", p: "/classes", private: true, title: "כיתות" },
    teachers: { id: "teachers", p: "/teachers", private: true, title: "מורים" },
    subjects: { id: "subjects", p: "/subjects", private: true, title: "מקצועות" },
    substitute: { id: "substitute", p: "/substitute", private: true, title: "מורים למילוי מקום" },
    annualSchedule: { id: "annualSchedule", p: "/annual-schedule", private: true, title: "מערכת שנתית" },
    dailySchedule: { id: "dailySchedule", p: "/daily-schedule", private: true, title: "שיבוץ יומי" },
    profile: { id: "profile", p: "/profile", private: true, title: "המשתמש שלי" },
    history: { id: "history", p: "/history", private: true, title: "היסטוריה" },
    teacherSignIn: { id: "teacherSignIn", p: "/teacher-sign-in", private: false, title: "כניסה למורים" },
    teacherPortal: { id: "teacherPortal", p: "/teacher-portal", private: false, title: "חומרי לימוד" },
    dailyScheduleReadonly: { id: "dailyScheduleReadonly", p: "/daily-schedule-readonly", private: false, title: "מערכת יומית" },
};

export default router;
