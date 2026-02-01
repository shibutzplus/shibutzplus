"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import Logo from "@/components/ui/Logo/Logo";
import styles from "../../../app/landing.module.css";
import Icons from "@/style/icons";
import Loading from "@/components/loading/Loading/Loading";
import { useState, Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import useContactUsPopup from "@/hooks/useContactUsPopup";
import { errorToast, successToast } from "@/lib/toast";
import messages from "@/resources/messages";
import { signInWithGoogle } from "@/app/actions/POST/signInAction";
import { useSession } from "next-auth/react";
import { STATUS_LOADING, STATUS_UNAUTH } from "@/models/constant/session";

const HeroSignInButton = (props: { title: string; className?: string }) => {
    const { status } = useSession();
    const [isLoading, setIsLoading] = useState(false);
    const searchParams = useSearchParams();
    const googleError = searchParams.get("error");
    const router = useRouter();

    useEffect(() => {
        if (googleError === "AccessDenied") {
            successToast(messages.auth.accessDenied, Infinity);
            router.replace(window.location.pathname);
        }
    }, [googleError, router]);

    useEffect(() => {
        if (status === STATUS_LOADING) setIsLoading(true);
    }, [status]);

    useEffect(() => {
        if (status === STATUS_UNAUTH) {
            setIsLoading(false);
        }
    }, [status]);

    const handleGoogleSignIn = async () => {
        setIsLoading(true);
        const res = await signInWithGoogle();
        if (!res.success) {
            errorToast(res.message);
            setIsLoading(false);
        } else if (res.url) {
            router.push(res.url);
        }
    };

    return (
        <button
            type="button"
            className={props.className || styles.btnHero}
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            style={{
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "10px",
            }}
        >
            {isLoading ? <Loading /> : <Icons.google size={22} />} {props.title}
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
    },
};

export default function LandingPage() {
    const { handleOpenContactPopup } = useContactUsPopup();

    return (
        <div className={styles.landingPage}>
            {/* Navbar */}
            <nav className={styles.navbar}>
                <div className={styles.navContent}>
                    <div className={styles.navLinks}>
                        <Suspense fallback={<Loading />}>
                            <HeroSignInButton title="התחברות למנהלים" className={styles.navLogin} />
                        </Suspense>
                        <button
                            type="button"
                            onClick={handleOpenContactPopup}
                            className={styles.navLink}
                            style={{
                                background: "none",
                                border: "none",
                                cursor: "pointer",
                                padding: 0,
                            }}
                        >
                            צרו קשר
                        </button>
                    </div>
                    <Logo size="S" />
                </div>
            </nav>

            {/* Hero Section */}
            <header className={styles.hero}>
                <div className={styles.heroBackground}>
                    <div className={`${styles.blob} ${styles.blob1}`} />
                    <div className={`${styles.blob} ${styles.blob2}`} />
                </div>
                <div className={styles.heroWrapper}>
                    <motion.div
                        className={styles.heroContent}
                        initial="hidden"
                        animate="visible"
                        variants={staggerContainer}
                    >
                        <motion.h1
                            className={styles.heroTitle}
                            variants={fadeInUp}
                            transition={{ duration: 0.6 }}
                        >
                            <span className={styles.highlight}>שיבוץ+</span>
                            <div>ניהול מערכת השעות</div>
                            <span>היומית</span>
                        </motion.h1>
                        <motion.div
                            className={styles.alert}
                            variants={fadeInUp}
                            transition={{ duration: 0.6, delay: 0.1 }}
                        >
                            <div>שיבוץ מורים מחליפים בקלות.</div>
                            <div>חיסכון בזמן יקר לסגני מנהלים/רכזי מערכת/מורים.</div>
                        </motion.div>
                        <motion.div
                            className={styles.heroBtnContainer}
                            variants={fadeInUp}
                            transition={{ duration: 0.6, delay: 0.2 }}
                        >
                            <Suspense fallback={<Loading />}>
                                <HeroSignInButton title="התחברות למנהלים" />
                            </Suspense>
                            <div className={styles.teacherInstruction}>
                                <strong>מורים?</strong> פנו להנהלת בית הספר לקבלת קישור לכניסה.
                            </div>
                            <button
                                onClick={() => {
                                    document.getElementById("value-proposition")?.scrollIntoView({ behavior: "smooth" });
                                }}
                                className={`${styles.scrollDownFab} ${styles.mobileFab}`}
                                aria-label="גלול למטה"
                            >
                                <Icons.arrowDown size={24} />
                            </button>
                        </motion.div>
                    </motion.div>

                    <motion.div
                        className={styles.heroMockup}
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                    >
                        <div className={styles.mockupDecoration} />
                        <div className={styles.laptopImgWrapper}>
                            <Image
                                src="/mockup_img.webp"
                                alt="שיבוץ+ Dashboard"
                                fill
                                className={styles.laptopImg}
                                priority
                                sizes="(max-width: 700px) 100vw, 50vw"
                            />
                        </div>
                    </motion.div>
                </div>
                <button
                    onClick={() => {
                        document.getElementById("value-proposition")?.scrollIntoView({ behavior: "smooth" });
                    }}
                    className={`${styles.scrollDownFab} ${styles.desktopFab}`}
                    aria-label="גלול למטה"
                >
                    <Icons.arrowDown size={24} />
                </button>
            </header>

            {/* Value Proposition Section */}
            <section id="value-proposition" className={styles.valueProp}>
                <div className={styles.valuePropContent}>
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
                                    <strong>חיסכון בזמן:</strong> איתור ממלאי מקום פנויים בעזרת
                                    המלצות חכמות.
                                </motion.li>
                                <motion.li variants={fadeInUp}>
                                    <strong>רצף פדגוגי:</strong> המורה החסר מעדכן את החומר הלימודי
                                    למחר, והמחליף רואה אותו מיד.
                                </motion.li>
                                <motion.li variants={fadeInUp}>
                                    <strong>שקיפות / סנכרון:</strong> המנהל והמורים רואים את כל
                                    השינויים והעדכונים אצלם במחשב או בטלפון בזמן אמת.
                                </motion.li>
                                <motion.li variants={fadeInUp}>
                                    <strong>אירועים בית ספריים:</strong> שילוב אירועים ופעילויות
                                    מיוחדות במערכת היומית, לקבלת תמונת מצב מלאה.
                                </motion.li>
                                <motion.li variants={fadeInUp}>
                                    <strong>פשטות ונגישות:</strong> מערכת ידידותית וקלה לתפעול,
                                    זמינה מכל מחשב או סמארטפון ללא צורך בהתקנה.
                                </motion.li>
                                <motion.li variants={fadeInUp}>
                                    <strong>עלות:</strong> המערכת כרגע בהרצה ולכן השימוש בה בשלב זה
                                    הוא ללא עלות.
                                </motion.li>
                            </motion.ul>
                        </motion.div>

                        <motion.div
                            className={styles.videoPlaceholder}
                            variants={fadeInUp}
                            transition={{ duration: 0.6, delay: 0.2 }}
                        >
                            <iframe
                                className={styles.desktopVideo}
                                width="100%"
                                height="100%"
                                src="https://www.youtube.com/embed/4S4qAJ7zbjg"
                                title="שיבוץ+ - סרטון הסבר"
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                                style={{ borderRadius: "16px" }}
                            />
                            <iframe
                                className={styles.mobileVideo}
                                width="100%"
                                height="100%"
                                src="https://www.youtube.com/embed/lAQN61gnVz8"
                                title="שיבוץ+ - סרטון הסבר"
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                                style={{ borderRadius: "16px" }}
                            />
                        </motion.div>
                    </motion.div>
                </div>

                {/* Footer moved inside the last section */}
                <footer className={styles.footer}>
                    <div className={styles.footerContent}>
                        <div className={styles.footerLinks}>
                            <button
                                type="button"
                                onClick={handleOpenContactPopup}
                                className={styles.footerLink}
                                style={{
                                    background: "none",
                                    border: "none",
                                    cursor: "pointer",
                                    padding: 0,
                                }}
                            >
                                צרו קשר
                            </button>
                            <span className={styles.footerDivider}>|</span>
                            <Link href="/terms" className={styles.footerLink} target="_blank" rel="noopener noreferrer">
                                תנאי שימוש
                            </Link>
                            <span className={styles.footerDivider}>|</span>
                            <Link href="/privacy" className={styles.footerLink} target="_blank" rel="noopener noreferrer">
                                מדיניות פרטיות
                            </Link>
                        </div>
                        <p className={styles.copyright}>&copy; 2025 שיבוץ+ | כל הזכויות שמורות</p>
                    </div>
                </footer>
            </section>

        </div>
    );
}
