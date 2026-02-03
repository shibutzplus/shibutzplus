"use client";

import React, { useEffect, useState } from "react";
import styles from "./PWAInstall.module.css";
import Icons from "@/style/icons";
import { usePopup } from "@/context/PopupContext";
import MsgPopup from "@/components/popups/MsgPopup/MsgPopup";

const PWAInstall: React.FC = () => {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [isIOS, setIsIOS] = useState(false);
    const [isStandalone, setIsStandalone] = useState(false);
    const { openPopup } = usePopup();

    useEffect(() => {
        // Check if app is already installed
        const standalone = window.matchMedia("(display-mode: standalone)").matches
            || (window.navigator as any).standalone
            || false;
        setIsStandalone(standalone);

        // Check if iOS
        const userAgent = window.navigator.userAgent.toLowerCase();
        setIsIOS(/iphone|ipad|ipod/.test(userAgent));

        const handler = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e);
        };

        window.addEventListener("beforeinstallprompt", handler);

        return () => {
            window.removeEventListener("beforeinstallprompt", handler);
        };
    }, []);

    const handleClick = async () => {
        if (isIOS) {
            // Show iOS instructions in popup
            const instructions = (
                <div>
                    <p><strong>באייפון ההתקנה ידנית ☹️</strong></p>
                    <ol style={{ textAlign: 'right', paddingRight: '1.5rem', lineHeight: '1.5' }}>
                        <li>לחצו על כפתור השיתוף (הריבוע עם החץ).</li>
                        <li>לחצו עוד והוספה למסך הבית.</li>
                        <li>לחצו על הוספה בפינה העליונה.</li>
                    </ol>
                </div>
            );

            openPopup(
                "msgPopup",
                "M",
                <MsgPopup message={instructions} okText="הבנתי" />
            );
        } else if (deferredPrompt) {
            // Android with beforeinstallprompt support
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;

            if (outcome === "accepted") {
                setDeferredPrompt(null);
            }
        } else {
            // Android without beforeinstallprompt (show instructions)
            const instructions = (
                <div>
                    <p><strong>התקנת האפליקציה</strong></p>
                    <p>לחצו על תפריט הדפדפן (שלוש נקודות) ובחרו "הוסף למסך הבית" או "התקן אפליקציה".</p>
                </div>
            );

            openPopup(
                "msgPopup",
                "M",
                <MsgPopup message={instructions} okText="הבנתי" />
            );
        }
    };

    // Don't show if already installed
    if (isStandalone) return null;

    // Show on mobile devices (iOS or Android)
    const isMobile = isIOS || /android/i.test(navigator.userAgent.toLowerCase());
    if (!isMobile) return null;

    return (
        <div className={styles.navLink} onClick={handleClick}>
            <Icons.install size={24} />
            <span>שמירה למסך הבית</span>
        </div>
    );
};

export default PWAInstall;
