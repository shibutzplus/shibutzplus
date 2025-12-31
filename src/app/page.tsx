"use client";

import Image from "next/image";
import { motion } from "motion/react";
import Logo from "@/components/ui/Logo/Logo";
import styles from "./landing.module.css";
import Loading from "@/components/loading/Loading/Loading";
import GoogleIcon from "@/components/ui/assets/googleIcon";
import { signIn } from "next-auth/react";
import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import router from "@/routes";

const GoogleSignInButton = () => {
    const [isLoading, setIsLoading] = useState(false);
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get("callbackUrl") || router.dailySchedule.p;

    const handleGoogleSignIn = async () => {
        setIsLoading(true);
        await signIn("google", { callbackUrl });
    };

    return (
        <button
            type="button"
            className={styles.googleButton}
            onClick={handleGoogleSignIn}
            disabled={isLoading}
        >
            {isLoading ? <Loading /> : null}
            <GoogleIcon /> התחברות
        </button>
    );
};

const HeroSignInButton = () => {
    const [isLoading, setIsLoading] = useState(false);
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get("callbackUrl") || router.dailySchedule.p;

    const handleGoogleSignIn = async () => {
        setIsLoading(true);
        await signIn("google", { callbackUrl });
    };

    return (
        <button
            type="button"
            className={styles.btnHero}
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            style={{
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "10px"
            }}
        >
            {isLoading ? <Loading /> : null} התחברות למנהלים
        </button>
    );
};

// Animation variants
const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
};

const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
        },
    },
};

export default function LandingPage() {
    return (
        <div className={styles.landingPage}>
            {/* Navbar */}
            <nav className={styles.navbar}>
                <div className={styles.navContent}>
                    <Suspense fallback={<Loading />}>
                        <GoogleSignInButton />
                    </Suspense>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <span className={styles.heroProductName}>
                            שיבוץ+
                        </span>
                        <Logo size="S" />
                    </div>
                </div>
            </nav>

            <main className={styles.scrollableContent}>
                {/* Hero Section */}
                <header className={styles.hero}>
                    <div className={styles.heroWrapper}>
                        <motion.div
                            className={styles.heroContent}
                            initial="hidden"
                            animate="visible"
                            variants={staggerContainer}
                        >
                            <motion.h1
                                className={styles.heroTitle1}
                                variants={fadeInUp}
                                transition={{ duration: 0.6 }}
                            >
                                ניהול מערכת שעות <span className={styles.underlined}>יומית</span> בבית הספר
                            </motion.h1>
                            <motion.h1
                                className={styles.heroTitle2}
                                variants={fadeInUp}
                                transition={{ duration: 0.6, delay: 0.1 }}
                            >
                                שיבוץ ממלא מקום בקלות וביעילות
                            </motion.h1>
                            <motion.p
                                className={styles.heroTitle3}
                                variants={fadeInUp}
                                transition={{ duration: 0.6, delay: 0.2 }}
                            >
                                מיועד עבור מנהלי המערכת בבית הספר
                            </motion.p>

                            <motion.div variants={fadeInUp} transition={{ duration: 0.6, delay: 0.2 }}>
                                <HeroSignInButton />
                            </motion.div>
                        </motion.div>

                        <motion.div
                            className={styles.heroMockup}
                            initial={{ opacity: 0, y: 40 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.4 }}
                        >
                            <div className={styles.laptopImgWrapper}>
                                <Image
                                    src="/mockup_img.png"
                                    alt="שיבוץ+"
                                    fill
                                    className={styles.laptopImg}
                                    priority
                                    sizes="(max-width: 700px) 100vw, 50vw"
                                />
                            </div>
                        </motion.div>
                    </div>
                </header>

                {/* Value Proposition Section */}
                <section className={styles.valueProp}>
                    <motion.div
                        className={`${styles.container} ${styles.grid2}`}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-100px" }}
                        variants={staggerContainer}
                    >
                        <motion.div
                            className={styles.valueText}
                            variants={fadeInUp}
                            transition={{ duration: 0.6 }}
                        >
                            <h2>למה שיבוץ+ ?</h2>
                            <motion.ul className={styles.featuresList} variants={staggerContainer}>
                                <motion.li variants={fadeInUp}>
                                    <strong>חיסכון בזמן:</strong> איתור ממלאי מקום פנויים בעזרת המלצות חכמות.
                                </motion.li>
                                <motion.li variants={fadeInUp}>
                                    <strong>רצף פדגוגי:</strong> המורה החסר מעדכן את החומר הלימודי למחר, והמחליף רואה אותו מיד.
                                </motion.li>
                                <motion.li variants={fadeInUp}>
                                    <strong>שקיפות / סנכרון:</strong> המנהל והמורים רואים את כל השינויים והעדכונים אצלם במחשב או בטלפון בזמן אמת.
                                </motion.li>
                                <motion.li variants={fadeInUp}>
                                    <strong>אירועים בית ספריים:</strong> שילוב אירועים ופעילויות מיוחדות בלוח היומי, לקבלת תמונת מצב מלאה ליום המחר.
                                </motion.li>
                                <motion.li variants={fadeInUp}>
                                    <strong>פשטות ונגישות:</strong> מערכת ידידותית וקלה לתפעול, זמינה מכל מחשב או סמארטפון ללא צורך בהתקנה.
                                </motion.li>
                                <motion.li variants={fadeInUp}>
                                    <strong>עלות:</strong> המערכת כרגע בהרצה ולכן השימוש בה בשלב זה הוא ללא עלות.
                                </motion.li>
                            </motion.ul>
                            <motion.div variants={fadeInUp} style={{ marginTop: "30px" }}>
                                <HeroSignInButton />
                            </motion.div>
                        </motion.div>
                        <motion.div
                            className={styles.videoPlaceholder}
                            variants={fadeInUp}
                            transition={{ duration: 0.6, delay: 0.2 }}
                        >
                            <iframe
                                width="100%"
                                height="100%"
                                src="https://www.youtube.com/embed/4S4qAJ7zbjg"
                                title="שיבוץ+ - סרטון הסבר"
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                                style={{ borderRadius: "16px" }}
                            />
                        </motion.div>
                    </motion.div>
                </section>
            </main>

            {/* Footer */}
            <footer className={styles.footer}>
                <div className={styles.container}>
                    <p>
                        &copy; 2025 שיבוץ+ | כל הזכויות שמורות
                        <span className={styles.footerSeparator}> | </span>
                        <button
                            onClick={() => alert("תנאי שימוש")}
                            className={styles.termsLink}
                        >
                            תנאי שימוש
                        </button>
                        <span className={styles.footerSeparator}> | </span>
                        <a href="mailto:shibutzplus@gmail.com" className={styles.termsLink}>
                            צרו קשר
                        </a>
                    </p>
                </div>
            </footer>
        </div>
    );
}
