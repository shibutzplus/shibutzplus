interface IRoute {
    id: string;
    p: string;
    private: boolean;
    title: string;
    menuTitle?: string;
}

const router: Record<string, IRoute> = {
    home: { id: "home", p: "/", private: false, title: "" },

    // Admin
    adminSignIn: { id: "adminSignIn", p: "/admin/sign-in", private: false, title: "כניסת מנהל" },
    signUp: { id: "signUp", p: "/sign-up", private: true, title: "בית ספר/מנהל חדש", menuTitle: "הוספת בית ספר/מנהל" },
    schoolSelect: { id: "schoolSelect", p: "/school-select", private: true, title: "בחירת בית ספר", },
    queries: { id: "queries", p: "/queries", private: true, title: "שאילתות", menuTitle: "שאילתות" },

    // Manager Portal
    signIn: { id: "signIn", p: "/", private: false, title: "כניסה" },
    dailyBuild: { id: "dailyBuild", p: "/daily-build", private: true, title: "שיבוץ יומי", },
    history: { id: "history", p: "/history", private: true, title: "היסטוריה", menuTitle: "היסטוריית שיבוצים" },
    classes: { id: "classes", p: "/classes", private: true, title: "כיתות" },
    groups: { id: "groups", p: "/groups", private: true, title: "קבוצות עבודה" },
    teachers: { id: "teachers", p: "/teachers", private: true, title: "מורים" },
    subjects: { id: "subjects", p: "/subjects", private: true, title: "מקצועות" },
    substitute: { id: "substitute", p: "/substitute", private: true, title: "מורים מילוי מקום" },
    staff: { id: "staff", p: "/staff", private: true, title: "אנשי מנהלה" },
    annualView: { id: "annualView", p: "/annual-view", private: true, title: "מערכת שבועית", menuTitle: "מערכת שבועית" },
    annualAltView: { id: "annualAltView", p: "/annual-alt-view", private: true, title: "מערכת לזמן חירום", menuTitle: "מערכת לזמן חירום" },
    missingReport: { id: "missingReport", p: "/missing-report", private: true, title: "דיווח מורים חסרים" },
    replaceReport: { id: "replaceReport", p: "/replace-report", private: true, title: "דיווח מורים מילוי מקום" },
    tutoringReport: { id: "tutoringReport", p: "/tutoring-report", private: true, title: "דוח שיבוץ פרטני לכיתות", menuTitle: "שיבוץ פרטני לכיתות" },
    statistics: { id: "statistics", p: "/statistics", private: true, title: "סטטיסטיקות" },

    // Teachers Portal
    teacherSignIn: { id: "teacherSignIn", p: "/teacher-sign-in", private: false, title: "כניסה למורים", },
    teacherChanges: { id: "teacherChanges", p: "/teacher-changes", private: false, title: "שינויים במערכת שלי", menuTitle: "המערכת שלי" },
    teacherChangesUnpublished: { id: "teacherChangesUnpublished", p: "/teacher-changes-unpublished", private: false, title: "שינויים שלא פורסמו", menuTitle: "המערכת שלי (שינויים שלא פורסמו)" },
    schoolChanges: { id: "schoolChanges", p: "/school-changes", private: false, title: "מערכת יומית", menuTitle: "מערכת בית ספרית" },
    schoolChangesFull: { id: "schoolChangesFull", p: "/school-changes-full", private: false, title: "מערכת בית ספרית", },
    teacherChangesAlt: { id: "teacherChangesAlt", p: "/teacher-changes-alt", private: false, title: "מערכת בזמן חירום", menuTitle: "המערכת שלי" },
    schoolChangesAlt: { id: "schoolChangesAlt", p: "/school-changes-alt", private: false, title: "מערכת בית ספרית לזמן חירום", menuTitle: "מערכת בית ספרית" },
    faqManager: { id: "faqManager", p: "/faq-manager", private: true, title: "שאלות נפוצות" },
    faqTeachers: { id: "faqTeachers", p: "/faq-teachers", private: false, title: "שאלות נפוצות" },
};

export default router;
