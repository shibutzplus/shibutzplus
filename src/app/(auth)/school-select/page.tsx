"use client";

import React, { useEffect, useState } from "react";
import styles from "./schoolSelect.module.css";
import { getSchoolsMinAction } from "@/app/actions/GET/getSchoolsMinAction";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import routes from "@/routes";
import { DEFAULT_REDIRECT } from "@/routes/protectedAuth";
import Loading from "@/components/loading/Loading/Loading";
import { logErrorAction } from "@/app/actions/POST/logErrorAction";
import { USER_ROLES } from "@/models/constant/auth";
import { SCHOOL_STATUS } from "@/models/constant/school";
import Icons from "@/style/icons";

const SchoolSelectPage = () => {
    const { data: session } = useSession();
    const router = useRouter();
    const [schools, setSchools] = useState<Array<{ id: string; name: string; city: string; deputyName: string | null }>>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        (async () => {
            try {
                const list = await getSchoolsMinAction();
                const schoolsList = Array.isArray(list) ? list : [];
                setSchools(schoolsList);
            } catch (error) {
                logErrorAction({ description: `Failed to load schools (school-select page): ${error instanceof Error ? error.message : String(error)}` });
            } finally {
                setIsLoading(false);
            }
        })();
    }, []);

    const handleSelect = (schoolId: string) => {
        try {
            const user = session?.user as { role: string; status: string } | undefined;
            if (user && user.role === USER_ROLES.ADMIN) {
                setIsLoading(true);
                const userStatus = user.status;
                const target = userStatus === SCHOOL_STATUS.ANNUAL ? DEFAULT_REDIRECT : routes.dailySchedule.p;
                router.push(`${target}?schoolId=${encodeURIComponent(schoolId)}`);
            }
        } catch {
            setIsLoading(false);
        }
    };

    const handleLogout = () => {
        void signOut({ callbackUrl: "/" });
    };

    return (
        <main className={styles.container}>
            <div className={styles.card}>
                <header className={styles.header}>
                    <button
                        type="button"
                        onClick={handleLogout}
                        className={styles.logoutBtn}
                        title="התנתקות"
                    >
                        <Icons.logOut size={22} />
                    </button>
                    <h1 className={styles.title}>בחירת בית ספר</h1>
                </header>
                {isLoading ? (
                    <Loading />
                ) : schools.length === 0 ? (
                    <p>לא נמצאו בתי ספר</p>
                ) : (
                    <ul className={styles.schoolList}>
                        {schools.map((s) => (
                            <li key={s.id} className={styles.schoolListItem}>
                                <button
                                    type="button"
                                    onClick={() => handleSelect(s.id)}
                                    className={styles.schoolButton}
                                >
                                    <div className={styles.schoolInfo}>
                                        <span className={styles.schoolName}>{s.name}</span>
                                        <span className={styles.schoolDetails}>
                                            {s.city}{s.deputyName ? ` - ${s.deputyName}` : ""}
                                        </span>
                                    </div>
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </main>
    );
};

export default SchoolSelectPage;
