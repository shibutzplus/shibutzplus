interface IRoute {
    p: string;
    private: boolean;
}

const router: Record<string, IRoute> = {
    home: { p: "/", private: false },
    login: { p: "/login", private: false },
    register: { p: "/register", private: false },
    dashboard: { p: "/dashboard", private: true },
    connect: { p: "/connect", private: true },
    about: { p: "/about", private: false },
}

export default router