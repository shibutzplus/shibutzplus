import TeacherAuthForm from "@/components/auth/TeacherAuthForm/TeacherAuthForm";
import styles from "./teacherSignIn.module.css";
import HeroSection from "@/components/layout/HeroSection/HeroSection";

const TeacherSignIn = () => {
    return (
        <main className={styles.container}>
            <div className={styles.mainSection}>
                <HeroSection
                    title="מערכת לניהול בית הספר"
                    description="בניית מערכת שעות, בצורה קלה ומהירה"
                />
                <div className={styles.formContainer}>
                    <TeacherAuthForm />
                </div>
                <footer className={styles.copyright}>&copy; שיבוץ+, כל הזכויות שמורות. 2025</footer>
            </div>
        </main>
    );
};

export default TeacherSignIn;
