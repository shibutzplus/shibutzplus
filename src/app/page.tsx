"use client";

import Link from "next/link";
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
                    <Logo size="S" />
                    <Suspense fallback={<Loading />}>
                        <GoogleSignInButton />
                    </Suspense>
                </div>
            </nav>

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
                            className={styles.heroTitle}
                            variants={fadeInUp}
                            transition={{ duration: 0.6 }}
                        >
                            ניהול מערכת השעות של בית הספר,{" "}
                            <span className={styles.highlight}>בצורה חכמה.</span>
                        </motion.h1>
                        <motion.p variants={fadeInUp} transition={{ duration: 0.6, delay: 0.1 }}>
                            הכלי המתקדם ביותר לסגני מנהלים למציאת ממלאי מקום וניהול שיבוצים יומיים
                            בלחיצת כפתור.
                        </motion.p>
                        <motion.div variants={fadeInUp} transition={{ duration: 0.6, delay: 0.2 }}>
                            <Link href="/sign-up" className={styles.btnHero}>
                                התחילו עכשיו
                            </Link>
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
                                alt="שיבוץ+ Dashboard"
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
                        <h2>למה להשתמש בשיבוץ+ ?</h2>
                        <motion.ul className={styles.featuresList} variants={staggerContainer}>
                            <motion.li variants={fadeInUp}>
                                <strong>חיסכון בזמן:</strong> מציאת ממלאי מקום בתוך דקות במקום שעות
                                של טלפונים.
                            </motion.li>
                            <motion.li variants={fadeInUp}>
                                <strong>דיוק מקסימלי:</strong> אלגוריתם חכם המתחשב בהתמחויות המורים
                                ובזמינותם.
                            </motion.li>
                            <motion.li variants={fadeInUp}>
                                <strong>שקיפות מלאה:</strong> עדכונים בזמן אמת למורים ולהנהלה ישירות
                                לנייד.
                            </motion.li>
                        </motion.ul>
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

            {/* Testimonials Section */}
            <section className={styles.testimonials}>
                <div className={styles.container}>
                    <motion.h2
                        className={styles.sectionTitle}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.6 }}
                    >
                        מה אומרים עלינו בשטח?
                    </motion.h2>
                    <motion.div
                        className={styles.testimonialsGrid}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-100px" }}
                        variants={staggerContainer}
                    >
                        <motion.div
                            className={styles.testimonialCard}
                            variants={fadeInUp}
                            transition={{ duration: 0.5 }}
                        >
                            <div className={styles.schoolInfo}>
                                <div className={styles.schoolLogo}>
                                    <Image
                                        src="/schoolLogos/school_img_sh.jpg"
                                        alt="שרת קריית אונו"
                                        width={60}
                                        height={60}
                                        style={{ objectFit: "cover", borderRadius: "8px" }}
                                    />
                                </div>
                                <div>
                                    <div className={styles.schoolName}>שרת קריית אונו</div>
                                    <div className={styles.deputyName}>אתי יוסף, סגנית מנהלת</div>
                                </div>
                            </div>
                            <p>
                                "השינוי הכי משמעותי שעשינו השנה. הבקרים שלי הפכו רגועים הרבה יותר."
                            </p>
                        </motion.div>
                        <motion.div
                            className={styles.testimonialCard}
                            variants={fadeInUp}
                            transition={{ duration: 0.5 }}
                        >
                            <div className={styles.schoolInfo}>
                                <div className={styles.schoolLogo}>
                                    <Image
                                        src="/schoolLogos/school_img_bbl.png"
                                        alt="בבלי ירושלמי"
                                        width={60}
                                        height={60}
                                        style={{ objectFit: "cover", borderRadius: "8px" }}
                                    />
                                </div>
                                <div>
                                    <div className={styles.schoolName}>בבלי ירושלמי</div>
                                    <div className={styles.deputyName}>קרן פאר, סגנית מנהלת</div>
                                </div>
                            </div>
                            <p>"מערכת אינטואיטיבית וקלה לתפעול. המורים מרוצים מהסדר והארגון."</p>
                        </motion.div>
                        <motion.div
                            className={styles.testimonialCard}
                            variants={fadeInUp}
                            transition={{ duration: 0.5 }}
                        >
                            <div className={styles.schoolInfo}>
                                <div className={styles.schoolLogo}>
                                    <Image
                                        src="/schoolLogos/school_img_ko.png"
                                        alt="קורצ'אק רמת גן"
                                        width={60}
                                        height={60}
                                        style={{ objectFit: "cover", borderRadius: "8px" }}
                                    />
                                </div>
                                <div>
                                    <div className={styles.schoolName}>קורצ'אק רמת גן</div>
                                    <div className={styles.deputyName}>הלית פנחס, סגנית מנהלת</div>
                                </div>
                            </div>
                            <p>"סוף סוף כלי שמבין את הצרכים האמיתיים של בתי הספר בישראל."</p>
                        </motion.div>
                        <motion.div
                            className={styles.testimonialCard}
                            variants={fadeInUp}
                            transition={{ duration: 0.5 }}
                        >
                            <div className={styles.schoolInfo}>
                                <div className={styles.schoolLogo}>
                                    <Image
                                        src="/schoolLogos/school_img_ron.jpg"
                                        alt="רונה רמון"
                                        width={60}
                                        height={60}
                                        style={{ objectFit: "cover", borderRadius: "8px" }}
                                    />
                                </div>
                                <div>
                                    <div className={styles.schoolName}>רונה רמון</div>
                                    <div className={styles.deputyName}>ליאת ששון, סגנית מנהלת</div>
                                </div>
                            </div>
                            <p>"מציאת ממלא מקום הפכה למשימה של שתי דקות. פשוט מדהים."</p>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* Footer */}
            <footer className={styles.footer}>
                <div className={styles.container}>
                    <p>&copy; 2025 שיבוץ+ | כל הזכויות שמורות</p>
                </div>
            </footer>
        </div>
    );
}
