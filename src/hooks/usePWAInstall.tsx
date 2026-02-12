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
                        <li>ההתקנה באייפון היא רק דרך דפדפן ספארי 🤷.</li>
                        <li>לחצו על כפתור השיתוף ואז הוספה למסך הבית.</li>
                    </ol>
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
