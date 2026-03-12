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
    signUp: { id: "signUp", p: "/sign-up", private: true, title: "בית ספר/מנהל חדש", menuTitle: "הוספת מנהל" },
    schoolSelect: { id: "schoolSelect", p: "/school-select", private: true, title: "בחירת בית ספר", },

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
    annualView: { id: "annualView", p: "/annual-view", private: true, title: "מערכת שנתית", menuTitle: "צפייה במערכת" },
    annualBuildByClass: { id: "annualBuildByClass", p: "/annual-build-class", private: true, title: "מערכת לפי כיתה", menuTitle: "שינוי מערכת לפי כיתה" },
    annualBuildByTeacher: { id: "annualBuildByTeacher", p: "/annual-build-teacher", private: true, title: "מערכת לפי מורה", menuTitle: "שינוי מערכת לפי מורה" },
    annualAltBuild: { id: "annualAltBuild", p: "/annual-alt-build", private: true, title: "מערכת זמן חירום", menuTitle: "שינוי מערכת" },
    annualAltView: { id: "annualAltView", p: "/annual-alt-view", private: true, title: "מערכת זמן חירום", menuTitle: "צפייה לפי כיתה ומורה" },
    statistics: { id: "statistics", p: "/statistics", private: true, title: "סטטיסטיקות" },

    // Teachers Portal
    teacherSignIn: { id: "teacherSignIn", p: "/teacher-sign-in", private: false, title: "כניסה למורים", },
    teacherChanges: { id: "teacherChanges", p: "/teacher-changes", private: false, title: "שינויים במערכת שלי", menuTitle: "המערכת שלי" },
    schoolChanges: { id: "schoolChanges", p: "/school-changes", private: false, title: "מערכת יומית", menuTitle: "מערכת בית ספרית" },
    schoolChangesFull: { id: "schoolChangesFull", p: "/school-changes-full", private: false, title: "מערכת במסך מלא", },
    teacherChangesAlt: { id: "teacherChangesAlt", p: "/teacher-changes-alt", private: false, title: "מערכת בזמן חירום", menuTitle: "המערכת שלי" },
    schoolChangesAlt: { id: "schoolChangesAlt", p: "/school-changes-alt", private: false, title: "מערכת בית ספרית לזמן חירום", menuTitle: "מערכת בית ספרית" },
    faqManager: { id: "faqManager", p: "/faq-manager", private: true, title: "שאלות נפוצות" },
    faqTeachers: { id: "faqTeachers", p: "/faq-teachers", private: false, title: "שאלות נפוצות" },
};

export default router;
