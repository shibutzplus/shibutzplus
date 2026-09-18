import { useState, useEffect, useCallback, useRef } from 'react';
import { usePopup } from '@/context/PopupContext';
import MsgPopup from '@/components/popups/MsgPopup/MsgPopup';
import React from 'react';
import Icons from '@/style/icons';
import { successToast } from '@/lib/toast';
import { getStorageTeacher } from '@/lib/localStorage';
import { generateSchoolUrl } from '@/utils';
import { usePathname } from 'next/navigation';
import { protectedPaths } from '@/routes/protectedAuth';

const usePWAInstall = () => {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [isIOS, setIsIOS] = useState(false);
    const [isIOSSafari, setIsIOSSafari] = useState(false);
    const [isStandalone, setIsStandalone] = useState(false);
    const { openPopup } = usePopup();
    const openPopupRef = useRef(openPopup);
    openPopupRef.current = openPopup;
    const pathname = usePathname();

    const handleCopyUrl = useCallback(async () => {
        try {
            const isManagerRoute = protectedPaths.some((p) => pathname === p || pathname?.startsWith(`${p}/`));
            let url = "https://shibutzplus.com";

            if (!isManagerRoute) {
                const teacher = getStorageTeacher();
                if (teacher?.id && teacher?.schoolId) {
                    url = generateSchoolUrl(teacher.schoolId, teacher.id);
                } else {
                    url = window.location.href;
                }
            }

            await navigator.clipboard.writeText(url);
            successToast("הקישור הועתק ללוח!", 2500);
        } catch {
            // fallback
        }
    }, [pathname]);

    useEffect(() => {
        // Check standalone mode
        const standalone = window.matchMedia("(display-mode: standalone)").matches
            || (window.navigator as any).standalone
            || false;
        setIsStandalone(standalone);

        // Check iOS & Safari
        const userAgent = window.navigator.userAgent.toLowerCase();
        const ios = /iphone|ipad|ipod/.test(userAgent);
        const isOtherBrowser = /crios|fxios|edgios|opios|fban|fbav|instagram|gsa|googleapp/.test(userAgent);

        setIsIOS(ios);
        // Real Safari on iOS includes both 'safari' and 'version/' in the UA, unlike in-app browsers
        setIsIOSSafari(ios && userAgent.includes('safari') && userAgent.includes('version/') && !isOtherBrowser);

        const checkAutoInstall = (promptEvent: any) => {
            const searchParams = new URLSearchParams(window.location.search);
            if (searchParams.get('autoInstall') === 'true') {
                const newUrl = new URL(window.location.href);
                newUrl.searchParams.delete('autoInstall');
                window.history.replaceState({}, '', newUrl.toString());

                openPopupRef.current("msgPopup", "M", (
                    <MsgPopup
                        message="לחצו כאן כדי להוסיף את שיבוץ+ למסך הבית"
                        okText="התקן עכשיו"
                        onOk={() => {
                            try {
                                promptEvent?.prompt?.();
                            } catch {}
                            setDeferredPrompt(null);
                        }}
                    />
                ));
            }
        };

        // Check globally captured prompt
        if ((window as any).deferredPrompt) {
            setDeferredPrompt((window as any).deferredPrompt);
            checkAutoInstall((window as any).deferredPrompt);
        }

        const handler = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e);
            (window as any).deferredPrompt = e;
            checkAutoInstall(e);
        };

        const onInstalled = () => {
            setIsStandalone(true);
            setDeferredPrompt(null);
        };

        window.addEventListener("beforeinstallprompt", handler);
        window.addEventListener("appinstalled", onInstalled);
        return () => {
            window.removeEventListener("beforeinstallprompt", handler);
            window.removeEventListener("appinstalled", onInstalled);
        };
    }, []);

    const installPWA = useCallback(async () => {
        if (isIOS) {
            const instructions = (
                <div>
                    <div style={{ textAlign: 'right', lineHeight: '1.6' }}>
                        {isIOSSafari ? (
                            <div>להתקנה לחצו על כפתור השיתוף ואז הוספה למסך הבית.</div>
                        ) : (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                <span>כדי להתקין את האפליקציה יש לפתוח את האתר בדפדפן ספארי.</span>
                                <button
                                    type="button"
                                    onClick={handleCopyUrl}
                                    title="העתק קישור"
                                    aria-label="העתק קישור"
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        padding: '2px',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        color: 'inherit',
                                    }}
                                >
                                    <Icons.copy size={15} />
                                </button>
                            </div>
                        )}
                    </div>
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
                            <span>▶ צפייה בסרטון הדרכה קצר</span>
                        </a>
                    </div>
                </div>
            );

            openPopup("msgPopup", "M", <MsgPopup message={instructions} okText="הבנתי" />);
        } else if (deferredPrompt) {
            try {
                await deferredPrompt.prompt();
            } catch {}
            setDeferredPrompt(null);
        } else {
            const isAndroid = /android/i.test(window.navigator.userAgent);

            if (isAndroid) {
                const url = new URL(window.location.href);
                url.searchParams.set('autoInstall', 'true');
                const cleanUrl = url.toString().replace(/^https?:\/\//, '').replace(/#.*$/, '');
                window.location.href = `intent://${cleanUrl}#Intent;scheme=https;package=com.android.chrome;S.browser_fallback_url=${encodeURIComponent(url.toString())};end`;
                return;
            }

            const instructions = (
                <div>
                    <ol style={{ textAlign: 'right', paddingRight: '1rem', lineHeight: '1.5' }}>
                        <li>לחצו על תפריט הדפדפן.</li>
                        <li>בחרו &quot;הוסף אל..מסך הבית&quot;.</li>
                    </ol>
                    <div style={{ marginTop: '0.8rem', textAlign: 'right' }}>
                        להסברים נוספים פתחו את השאלות הנפוצות בתפריט
                    </div>
                </div>
            );

            openPopup("msgPopup", "M", <MsgPopup message={instructions} okText="הבנתי" />);
        }
    }, [isIOS, isIOSSafari, handleCopyUrl, openPopup, deferredPrompt]);

    return {
        installPWA,
        isInstalled: isStandalone,
    };
};

export default usePWAInstall;
