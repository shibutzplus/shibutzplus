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
 * - For new users, registerAndSubscribe must be called with isManual=true via user gesture.
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
        if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
            console.log("Push notifications not supported");
            return;
        }

        if (isRegistering.current) {
            return;
        }

        try {
            isRegistering.current = true;
            // 1. Register Service Worker
            const registration = await navigator.serviceWorker.register("/sw.js");

            // 2. Check permission - if not granted, request it ONLY if this is a manual trigger (user gesture)
            let currentPermission = Notification.permission;
            if (currentPermission !== "granted") {
                if (!isManual) {
                    // Silently stop if we don't have permission and weren't asked by user
                    return;
                }
                currentPermission = await Notification.requestPermission();
                setPermission(currentPermission);
            }

            if (currentPermission !== "granted") {
                console.log("Notification permission not granted");
                return;
            }

            // 3. Subscribe
            const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
            if (!vapidKey) {
                void logErrorAction({
                    description: "[Push Hook] VAPID public key not found",
                    schoolId: schoolId,
                    user: teacherId
                });
                return;
            }

            const existingSub = await registration.pushManager.getSubscription();
            if (existingSub) {
                setSubscription(existingSub);
                await saveSubscription(existingSub, schoolId, teacherId);
                return;
            }

            const newSub = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(vapidKey),
            });

            setSubscription(newSub);
            await saveSubscription(newSub, schoolId, teacherId);

        } catch (error) {
            void logErrorAction({
                description: `[Push Hook] Error subscribing to push notifications: ${error instanceof Error ? error.message : String(error)}`,
                schoolId: schoolId,
                user: teacherId
            });
        } finally {
            isRegistering.current = false;
        }
    };

    const saveSubscription = async (sub: PushSubscription, schoolId: string, teacherId?: string) => {
        try {
            await fetch("/api/push/subscribe", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    subscription: sub,
                    schoolId: schoolId,
                    teacherId: teacherId
                }),
            });
        } catch (err) {
            void logErrorAction({
                description: `[Push Hook] Failed to save subscription to server: ${err instanceof Error ? err.message : String(err)}`,
                schoolId: schoolId,
                user: teacherId
            });
        }
    };

    return { registerAndSubscribe, subscription, permission, isSupported, showIcon };
}
