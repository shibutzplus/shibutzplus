/**
 * Handles the client-side logic for Web Push Notifications.
 * Used in PortalPageLayout.
 * 
 * 1. Check if the browser supports Service Workers and Push API.
 * 2. Register the Service Worker (`sw.js`).
 * 3. Check current status permission.
 *    if there is permission require user gesture for requestPermission
 *    if there is no permission then do nothing. 
 * 4. Subscribe the device to the Push Manager using the VAPID public key.
 * 5. Send the subscription details (endpoint, keys) to the backend API.
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

        // Push notifications is not supported on this browser (probably old)
        if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
            return;
        }

        if (isRegistering.current) {
            return;
        }

        // currentPermission can be: granted, default, denied
        const currentPermission = "Notification" in window ? Notification.permission : "default";

        if (currentPermission === "denied") {
            void logErrorAction({ description: `[Push] Teacher blocked notifications`, schoolId: schoolId, user: teacherId, metadata: { isManual } });
            return;
        }

        if (currentPermission === "default") {
            if (!isManual) return;

            const result = await Notification.requestPermission();
            setPermission(result);

            if (result !== "granted") {
                void logErrorAction({
                    description: `[Push] Teacher Denied notifications`,    // clicked Bell but did not click Allow
                    schoolId: schoolId,
                    user: teacherId,
                    metadata: { permission: Notification.permission, isManual }
                });
                return;
            }
        }

        try {
            isRegistering.current = true;
            setIsBlockedByAntivirus(false);

            let registration;
            try {
                registration = await navigator.serviceWorker.register("/sw.js");
            } catch (swError) {
                const errorInfo = swError instanceof Error ? { name: swError.name, message: swError.message } : swError;
                const errorMessage = swError instanceof Error ? swError.message : String(swError);

                if (errorMessage.includes("Rejected")) {
                    setIsBlockedByAntivirus(true);
                    void logErrorAction({
                        description: `[Push] SW Registration Blocked by Antivirus`,
                        schoolId: schoolId,
                        user: teacherId,
                        metadata: { isManual, errorInfo, errorMessage }
                    });

                    if (isManual) throw new Error("AntivirusBlocking"); // displays a notification to the user
                    return;
                }

                throw swError;
            }

            const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
            if (!vapidKey) throw new Error("VAPID public key not found");

            let sub = await registration.pushManager.getSubscription();
            if (!sub) {
                const applicationServerKey = urlBase64ToUint8Array(vapidKey);
                await navigator.serviceWorker.ready;

                try {
                    sub = await registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: applicationServerKey as any });
                } catch (subError: any) {
                    throw subError;
                }
            }

            setSubscription(sub);
            await saveSubscription(sub, schoolId, teacherId);

        } catch (error) {
            if (!(error instanceof Error && error.message === "AntivirusBlocking")) {
                void logErrorAction({
                    description: `[Push] Error subscribing`,
                    schoolId: schoolId,
                    user: teacherId,
                    metadata: { error: error instanceof Error ? { name: error.name, message: error.message } : error, isManual }
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
