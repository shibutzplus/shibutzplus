interface IRoute {
    p: string;
    private: boolean;
}

const router: Record<string, IRoute> = {
    home: { p: "/", private: false },
    login: { p: "/sign-in", private: false },
    register: { p: "/sign-up", private: false },
    dashboard: { p: "/dashboard", private: true },
    connect: { p: "/connect", private: true },
    about: { p: "/about", private: false },
    forget: {p: "/forget", private: false},
    schedule: {p: "/schedule", private: true},
    classes: {p: "/classes", private: true},
    settings: {p: "/settings", private: true},
    teachers: {p: "/teachers", private: true}
}

export default router