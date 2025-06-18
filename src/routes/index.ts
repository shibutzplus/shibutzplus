interface IRoute {
    p: string;
    private: boolean;
    title: string;
}

const router: Record<string, IRoute> = {
    home: { p: "/", private: false, title: "" },
    signIn: { p: "/sign-in", private: false, title: "כניסה" },
    signUp: { p: "/sign-up", private: false, title: "הרשמה" },
    forget: { p: "/forget", private: false, title: "שכחתי סיסמה" },
    about: { p: "/about", private: false, title: "אודות" },
    dashboard: { p: "/dashboard", private: true, title: "מסך ראשי" },
    classes: { p: "/classes", private: true, title: "ניהול רשימת כיתות" },
    teachers: { p: "/teachers", private: true, title: "ניהול רשימת מורים" },
    professions: { p: "/professions", private: true, title: "ניהול רשימת מקצועות" },
    annualSystem: { p: "/annual-system", private: true, title: "מערכת שנתית" },
    connect: { p: "/connect", private: true, title: "צורו קשר" },
    profile: { p: "/profile", private: true, title: "הפרופיל שלי" },
};

export default router;
