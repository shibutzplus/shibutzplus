interface IRoute {
    id: string;
    p: string;
    private: boolean;
    title: string;
}

const router: Record<string, IRoute> = {
    home: { id: "home", p: "/", private: false, title: "" },
    signIn: { id: "signIn", p: "/", private: false, title: "כניסה" },
    signUp: { id: "signUp", p: "/sign-up", private: true, title: "בית ספר/מנהל חדש" },
    schoolSelect: { id: "schoolSelect", p: "/school-select", private: true, title: "בחירת בית ספר", },
    classes: { id: "classes", p: "/classes", private: true, title: "כיתות" },
    groups: { id: "groups", p: "/groups", private: true, title: "קבוצות עבודה" },
    teachers: { id: "teachers", p: "/teachers", private: true, title: "מורים" },
    subjects: { id: "subjects", p: "/subjects", private: true, title: "מקצועות" },
    substitute: { id: "substitute", p: "/substitute", private: true, title: "מורים מילוי מקום" },
    staff: { id: "staff", p: "/staff", private: true, title: "אנשי מנהלה" },
    annualBuildByClass: { id: "annualBuildByClass", p: "/annual-build-class", private: true, title: "מערכת שנתית לפי כיתה", },
    annualBuildByTeacher: { id: "annualBuildByTeacher", p: "/annual-build-teacher", private: true, title: "מערכת שנתית לפי מורה", },
    annualView: { id: "annualView", p: "/annual-view", private: true, title: "מערכת שנתית" },
    annualAltBuild: { id: "annualAltBuild", p: "/annual-alt-build", private: true, title: "מערכת זמן חירום" },
    annualAltView: { id: "annualAltView", p: "/annual-alt-view", private: true, title: "מערכת זמן חירום" },
    dailyBuild: { id: "dailyBuild", p: "/daily-build", private: true, title: "שיבוץ יומי", },
    history: { id: "history", p: "/history", private: true, title: " היסטוריה מערכות" },
    reports: { id: "reports", p: "/reports", private: true, title: "דוחות" },
    teacherSignIn: { id: "teacherSignIn", p: "/teacher-sign-in", private: false, title: "כניסה למורים", },
    teacherChanges: { id: "teacherChanges", p: "/teacher-changes", private: false, title: "שינויים במערכת שלי", },
    schoolChanges: { id: "schoolChanges", p: "/school-changes", private: false, title: "מערכת יומית", },
    schoolChangesFull: { id: "schoolChangesFull", p: "/school-changes-full", private: false, title: "מערכת במסך מלא", },
    teacherChangesAlt: { id: "teacherChangesAlt", p: "/teacher-changes-alt", private: false, title: "מערכת בזמן חירום", },
    schoolChangesAlt: { id: "schoolChangesAlt", p: "/school-changes-alt", private: false, title: "מערכת בית ספרית לזמן חירום", },
    faqManager: { id: "faqManager", p: "/faq-manager", private: true, title: "שאלות נפוצות" },
    faqTeachers: { id: "faqTeachers", p: "/faq-teachers", private: false, title: "שאלות נפוצות" },
    adminSignIn: { id: "adminSignIn", p: "/admin/sign-in", private: false, title: "כניסת מנהל" },
};

export default router;
