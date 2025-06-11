import React from "react";
import Link from "next/link";
import styles from "./about.module.css";
import routePath from "../../../routes";

const AboutPage: React.FC = () => {
    return (
        <div className={styles.container}>
            <div className={styles.content}>
                <h1 className={styles.title}>About ShibutzPlus</h1>
                <div className={styles.navigation}>
                    <Link href={routePath.home.p} className={styles.link}>
                        Home
                    </Link>
                    <Link href={routePath.login.p} className={styles.link}>
                        Login
                    </Link>
                    <Link href={routePath.register.p} className={styles.link}>
                        Register
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default AboutPage;
