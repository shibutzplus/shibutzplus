import AuthHero from "@/components/AuthHero/AuthHero";
import LoginForm from "@/components/LoginForm/LoginForm";
import styles from "./login.module.css";

const LoginPage: React.FC = () => {
    return (
        <main className={styles.container}>
            <div className={styles.contentWrapper}>
                <AuthHero />
                <LoginForm />
            </div>
        </main>
    );
};

export default LoginPage;
