import TeacherAuthForm from "@/components/auth/TeacherAuthForm/TeacherAuthForm";
import styles from "./teacherSignIn.module.css";
import Logo from "@/components/core/Logo/Logo";

const TeacherSignIn = () => {
    return (
        <div className={styles.container}>
            <div className={styles.centerBox}>
                <div className={styles.logoBox}>
                    <Logo size="L" />
                </div>
                <h1 className={styles.title}>שיבוץ+</h1>
                <div className={styles.subtitle}>מערכת שעות אישית</div>
                <div className={styles.cardWrapper}>
                    <TeacherAuthForm />
                </div>
                <footer className={styles.copyright}>
                    &copy; שיבוץ+, כל הזכויות שמורות. 2025
                </footer>
            </div>
        </div>
    );
};

export default TeacherSignIn;
