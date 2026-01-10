"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import Logo from "@/components/ui/Logo/Logo";
import styles from "./landing.module.css";
import Loading from "@/components/loading/Loading/Loading";
import { signIn } from "next-auth/react";
import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import router from "@/routes";
import useContactUsPopup from "@/hooks/useContactUsPopup";

const HeroSignInButton = (props: { title: string; className?: string }) => {
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
            {isLoading ? <Loading /> : null} {props.title}
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
                        <button 
                            type="button" 
                            onClick={handleOpenContactPopup} 
                            className={styles.navLink}
                            style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
                        >
                            צרו קשר
                        </button>
                        <Suspense fallback={<Loading />}>
                            <HeroSignInButton title="התחברות" className={styles.navLogin} />
                        </Suspense>
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
                            <div>
                                ניהול מערכת שעות <span className={styles.highlight}>יומית</span>
                            </div>
                            <div>בבית הספר</div>
                        </motion.h1>
                        <motion.p 
                            className={styles.heroDescription}
                            variants={fadeInUp} 
                            transition={{ duration: 0.6, delay: 0.1 }}
                        >
                            שיבוץ ממלא מקום בקלות וביעילות
                        </motion.p>
                        <motion.div
                            className={styles.alert}
                            variants={fadeInUp}
                            transition={{ duration: 0.6, delay: 0.1 }}
                        >
                            <div>מיועד עבור מנהלי המערכת בבית הספר</div>
                            <div>מורים, צרו קשר עם הנהלת בית הספר לקבלת קישור מתאים</div>
                        </motion.div>
                        <motion.div 
                            className={styles.heroBtnContainer}
                            variants={fadeInUp} 
                            transition={{ duration: 0.6, delay: 0.2 }}
                        >
                            <Suspense fallback={<Loading />}>
                                <HeroSignInButton title="התחברות למנהלים" />
                            </Suspense>
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
                                    <strong>חיסכון בזמן:</strong> איתור ממלאי מקום פנויים בעזרת המלצות
                                    חכמות.
                                </motion.li>
                                <motion.li variants={fadeInUp}>
                                    <strong>רצף פדגוגי:</strong> המורה החסר מעדכן את החומר הלימודי למחר,
                                    והמחליף רואה אותו מיד.
                                </motion.li>
                                <motion.li variants={fadeInUp}>
                                    <strong>שקיפות / סנכרון:</strong> המנהל והמורים רואים את כל השינויים
                                    והעדכונים אצלם במחשב או בטלפון בזמן אמת.
                                </motion.li>
                                <motion.li variants={fadeInUp}>
                                    <strong>אירועים בית ספריים:</strong> שילוב אירועים ופעילויות מיוחדות
                                    בלוח היומי, לקבלת תמונת מצב מלאה ליום המחר.
                                </motion.li>
                                <motion.li variants={fadeInUp}>
                                    <strong>פשטות ונגישות:</strong> מערכת ידידותית וקלה לתפעול, זמינה
                                    מכל מחשב או סמארטפון ללא צורך בהתקנה.
                                </motion.li>
                                <motion.li variants={fadeInUp}>
                                    <strong>עלות:</strong> המערכת כרגע בהרצה ולכן השימוש בה בשלב זה הוא
                                    ללא עלות.
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
                </div>

                {/* Footer moved inside the last section */}
                <footer className={styles.footer}>
                    <div className={styles.footerContent}>
                        <div className={styles.footerLinks}>
                            <button 
                                type="button" 
                                onClick={handleOpenContactPopup} 
                                className={styles.footerLink}
                                style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
                            >
                                צרו קשר
                            </button>
                            <span className={styles.footerDivider}>|</span>
                            <Link href="/terms" className={styles.footerLink}>תנאי שימוש</Link>
                            <span className={styles.footerDivider}>|</span>
                            <Link href="/privacy" className={styles.footerLink}>מדיניות פרטיות</Link>
                        </div>
                        <p className={styles.copyright}>&copy; 2025 שיבוץ+ | כל הזכויות שמורות</p>
                    </div>
                </footer>
            </section>

            {/* Testimonials Section */}
            <section className={styles.testimonials} style={{ display: "none" }}>
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
                                &quot;השינוי הכי משמעותי שעשינו השנה. הבקרים שלי הפכו רגועים הרבה יותר.&quot;
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
                            <p>&quot;מערכת אינטואיטיבית וקלה לתפעול. המורים מרוצים מהסדר והארגון.&quot;</p>
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
                                        alt="קורצ&apos;אק רמת גן"
                                        width={60}
                                        height={60}
                                        style={{ objectFit: "cover", borderRadius: "8px" }}
                                    />
                                </div>
                                <div>
                                    <div className={styles.schoolName}>קורצ&apos;אק רמת גן</div>
                                    <div className={styles.deputyName}>הלית פנחס, סגנית מנהלת</div>
                                </div>
                            </div>
                            <p>&quot;סוף סוף כלי שמבין את הצרכים האמיתיים של בתי הספר בישראל.&quot;</p>
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
                            <p>&quot;מציאת ממלא מקום הפכה למשימה של שתי דקות. פשוט מדהים.&quot;</p>
                        </motion.div>
                    </motion.div>
                </div>
            </section>
        </div>
    );
}
