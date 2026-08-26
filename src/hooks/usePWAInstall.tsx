import { useState, useEffect } from 'react';
import { usePopup } from '@/context/PopupContext';
import MsgPopup from '@/components/popups/MsgPopup/MsgPopup';
import React from 'react';

const usePWAInstall = () => {
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

        // Check for globally captured prompt
        if ((window as any).deferredPrompt) {
            setDeferredPrompt((window as any).deferredPrompt);
        }

        const handler = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e);
            (window as any).deferredPrompt = e;
        };

        window.addEventListener("beforeinstallprompt", handler);

        return () => {
            window.removeEventListener("beforeinstallprompt", handler);
        };
    }, []);

    const installPWA = async () => {
        if (isIOS) {
            // Show iOS instructions in popup
            const instructions = (
                <div>
                    <ol style={{ textAlign: 'right', paddingRight: '1rem', lineHeight: '1.6' }}>
                        <li>ודאו שאתם בדפדפן ספארי.</li>
                        <li>כנסו למשתמש שלכם בשיבוץ+ כרגיל.</li>
                        <li>לחצו על כפתור השיתוף (למטה) ואז הוספה למסך הבית.</li>
                    </ol>
                    <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                        <a
                            href="https://www.youtube.com/shorts/oWHuZoN571Y"
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                                textDecoration: 'none',
                                fontWeight: 'bold',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.4rem',
                                padding: '0.4rem 0.8rem',
                                borderRadius: '8px',
                                border: '1px solid rgba(0, 0, 0, 0.1)',
                            }}
                        >
                            <span>▶ לצפייה בסרטון הדרכה קצר</span>
                        </a>
                    </div>
                </div>
            );

            openPopup(
                "msgPopup",
                "M",
                <MsgPopup message={instructions} okText="הבנתי" />
            );
        } else if (deferredPrompt) {
            // Android/Desktop with native prompt
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;

            if (outcome === "accepted") {
                setDeferredPrompt(null);
            }
        } else {
            // Fallback instructions
            const instructions = (
                <div>
                    <ol style={{ textAlign: 'right', paddingRight: '1rem', lineHeight: '1.5' }}>
                        <li>לחצו על תפריט הדפדפן.</li>
                        <li>בחרו &quot;הוסף אל..מסך הבית&quot;.</li>
                    </ol>
                </div>
            );

            openPopup(
                "msgPopup",
                "M",
                <MsgPopup message={instructions} okText="הבנתי" />
            );
        }
    };

    return {
        installPWA,
        isInstalled: isStandalone
    };
};

export default usePWAInstall;
