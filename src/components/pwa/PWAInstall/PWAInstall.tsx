"use client";

import React, { useEffect, useState } from "react";
import styles from "./PWAInstall.module.css";

const PWAInstall: React.FC = () => {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [isIOS, setIsIOS] = useState(false);
    const [showIOSInstructions, setShowIOSInstructions] = useState(false);
    const [isStandalone, setIsStandalone] = useState(false);

    useEffect(() => {
        // Check if app is already installed (running in standalone mode)
        const standalone = window.matchMedia("(display-mode: standalone)").matches
            || (window.navigator as any).standalone
            || false;
        setIsStandalone(standalone);
        alert(`PWA Install - isStandalone: ${standalone}`);

        // Check if iOS
        const userAgent = window.navigator.userAgent.toLowerCase();
        const iOS = /iphone|ipad|ipod/.test(userAgent);
        setIsIOS(iOS);
        alert(`PWA Install - isIOS: ${iOS}\nuserAgent: ${userAgent}`);

        const handler = (e: Event) => {
            alert("PWA Install - beforeinstallprompt event fired");
            e.preventDefault();
            setDeferredPrompt(e);
        };

        window.addEventListener("beforeinstallprompt", handler);

        return () => {
            window.removeEventListener("beforeinstallprompt", handler);
        };
    }, []);

    const handleInstallClick = async () => {
        alert(`PWA Install - Button clicked\nisIOS: ${isIOS}\ndeferredPrompt: ${!!deferredPrompt}`);

        if (isIOS) {
            // For iOS, toggle instructions
            alert("PWA Install - Toggling iOS instructions");
            setShowIOSInstructions(!showIOSInstructions);
        } else if (deferredPrompt) {
            // For Android/Chrome
            alert("PWA Install - Showing install prompt");
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            alert(`PWA Install - User choice: ${outcome}`);

            if (outcome === "accepted") {
                setDeferredPrompt(null);
            }
        }
    };

    // Don't show if already installed/running in standalone mode
    if (isStandalone) {
        alert("PWA Install - Not showing (standalone mode)");
        return null;
    }

    // Show button for iOS or when deferredPrompt is available
    if (!isIOS && !deferredPrompt) {
        alert("PWA Install - Not showing (not iOS and no deferredPrompt)");
        return null;
    }

    alert("PWA Install - Showing button");

    return (
        <div className={styles.container}>
            <button
                className={styles.installButton}
                onClick={(e) => {
                    alert("CLICK EVENT FIRED!");
                    e.preventDefault();
                    handleInstallClick();
                }}
            >
                שמירת האפליקציה במסך הבית
            </button>

            {isIOS && showIOSInstructions && (
                <div className={styles.iosInstructions}>
                    <div className={styles.instructionsHeader}>
                        <span>הוספה למסך הבית</span>
                        <button
                            className={styles.closeBtn}
                            onClick={() => setShowIOSInstructions(false)}
                            aria-label="סגור"
                        >
                            ✕
                        </button>
                    </div>
                    <ol className={styles.stepsList}>
                        <li>
                            <span className={styles.stepNumber}>1</span>
                            <span>לחצו על כפתור השיתוף <span className={styles.icon}>📤</span></span>
                        </li>
                        <li>
                            <span className={styles.stepNumber}>2</span>
                            <span>בחרו <strong>"הוסף למסך הבית"</strong></span>
                        </li>
                        <li>
                            <span className={styles.stepNumber}>3</span>
                            <span>לחצו על <strong>"הוסף"</strong> בפינה העליונה</span>
                        </li>
                    </ol>
                </div>
            )}
        </div>
    );
};

export default PWAInstall;
