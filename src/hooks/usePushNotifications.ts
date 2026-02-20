/**
 * Handles the client-side logic for Web Push Notifications.
 * Used in PortalPageLayout and HamburgerNav.
 * 
 * 1. Check if the browser supports Service Workers and Push API.
 * 2. Check current notification permission (Denied/Default/Granted).
 * 3. Request permission if needed (requires user gesture).
 * 4. Register the Service Worker (`sw.js`).
 * 5. Subscribe the device to the Push Manager using the VAPID public key.
 * 6. Send the subscription details to the backend API.
 * 
 * - Automatic background registration only works if permission is ALREADY granted.
 */
"use client";

import { useState, useEffect, useRef } from "react";
import { logErrorAction } from "@/app/actions/POST/logErrorAction";

// Base64 to Uint8Array helper
function urlBase64ToUint8Array(base64String: string) {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
        .replace(/\-/g, "+")
        .replace(/_/g, "/");

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

export function usePushNotifications() {
    const [subscription, setSubscription] = useState<PushSubscription | null>(null);
    const [permission, setPermission] = useState<NotificationPermission>("default");
    const [isSupported, setIsSupported] = useState(false);
    const [showIcon, setShowIcon] = useState(false);
    const [isBlockedByAntivirus, setIsBlockedByAntivirus] = useState(false);
    const isRegistering = useRef(false);

    useEffect(() => {
        if ("Notification" in window) {
            setPermission(Notification.permission);
        }

        const supportsPush = "serviceWorker" in navigator && "PushManager" in window;
        setIsSupported(supportsPush);

        // Check if iOS
        const userAgent = window.navigator.userAgent.toLowerCase();
        const isIOS = /iphone|ipad|ipod/.test(userAgent);

        // Check if Standalone (Installed)
        const isStandalone = window.matchMedia("(display-mode: standalone)").matches
            || (window.navigator as any).standalone
            || false;

        // On iOS, we only show the icon if it's already installed as PWA (Standalone APP)
        // On other platforms (Android/Desktop), we show it if push is supported by browser
        if (isIOS) {
            setShowIcon(isStandalone && supportsPush);
        } else {
            setShowIcon(supportsPush);
        }
    }, []);

    const registerAndSubscribe = async (schoolId: string, teacherId?: string, isManual: boolean = false) => {
        if (!isSupported) return;
        if (isRegistering.current) return;

        const currentPermission = Notification.permission;

        if (currentPermission === "denied") {
            // Currently not logging this error as there is nothing we can do about teachers which blocked the notifications.
            // void logErrorAction({ description: `[Push] Teacher blocked notifications`, schoolId, user: teacherId, metadata: { isManual } });
            return;
        }

        if (currentPermission === "default") {
            if (!isManual) return;
            const result = await Notification.requestPermission();
            setPermission(result);
            if (result !== "granted") {
                void logErrorAction({ description: `[Push] Teacher Denied ShibutzPlus notification`, schoolId, user: teacherId, metadata: { permission: result, isManual } });
                return;
            }
        }

        try {
            isRegistering.current = true;
            setIsBlockedByAntivirus(false);

            let registration;
            try {
                registration = await navigator.serviceWorker.register("/sw.js");
            } catch (swError: any) {
                if (swError?.message?.includes("Rejected")) {
                    setIsBlockedByAntivirus(true);
                    void logErrorAction({
                        description: `[Push] SW Registration Blocked by Antivirus`,
                        schoolId,
                        user: teacherId,
                        metadata: { isManual, error: { name: swError.name, message: swError.message } }
                    });
                    if (isManual) throw new Error("AntivirusBlocking");
                    return;
                }
                throw swError;
            }

            const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
            if (!vapidKey) throw new Error("VAPID public key not found");

            let sub = await registration.pushManager.getSubscription();
            if (!sub) {
                await navigator.serviceWorker.ready;
                sub = await registration.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: urlBase64ToUint8Array(vapidKey)
                });
            }

            setSubscription(sub);
            await saveSubscription(sub, schoolId, teacherId);

        } catch (error: any) {
            if (error.message !== "AntivirusBlocking") {
                void logErrorAction({
                    description: `[Push] Error subscribing`,
                    schoolId,
                    user: teacherId,
                    metadata: { error: { name: error.name, message: error.message }, isManual }
                });
            }
            throw error;
        } finally {
            isRegistering.current = false;
        }
    };

    const saveSubscription = async (sub: PushSubscription, schoolId: string, teacherId?: string) => {
        try {
            await fetch("/api/push/subscribe", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ subscription: sub, schoolId: schoolId, teacherId: teacherId }),
            });
        } catch (err) {
            void logErrorAction({
                description: `[Push] Failed to save subscription to server: ${err instanceof Error ? err.message : String(err)}`,
                schoolId: schoolId,
                user: teacherId
            });
        }
    };

    return { subscribeToPushNotification: registerAndSubscribe, subscription, permission, isSupported, showIcon, isBlockedByAntivirus };
}
