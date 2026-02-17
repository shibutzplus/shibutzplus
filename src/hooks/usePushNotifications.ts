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
        if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
            console.log("Push notifications not supported");
            return;
        }

        if (isRegistering.current) {
            return;
        }

        let step = "0: init"; // Track progress

        try {
            isRegistering.current = true;
            setIsBlockedByAntivirus(false); // Reset blocked state on new attempt

            step = "1: register-sw";
            let registration;
            try {
                registration = await navigator.serviceWorker.register("/sw.js");
            } catch (swError) {
                step = "1: register-sw-failed";
                const errorInfo = swError instanceof Error ? {
                    name: swError.name,
                    message: swError.message,
                    stack: swError.stack
                } : swError;

                // Check for generic "Rejected" or Webroot specifics
                const errorMessage = swError instanceof Error ? swError.message : String(swError);
                const stackTrace = swError instanceof Error ? swError.stack : "";
                const isRejectedOrWebroot = errorMessage.includes("Rejected") || (stackTrace && stackTrace.includes("wrsParams"));

                if (isRejectedOrWebroot) {
                    // Mark as blocked so UI can show the bell/alert
                    setIsBlockedByAntivirus(true);

                    if (isManual) {
                        void logErrorAction({
                            description: `[Push Hook] Service Worker Registration Blocked by Antivirus (Manual): ${errorMessage}`,
                            schoolId: schoolId,
                            user: teacherId,
                            metadata: {
                                isManual,
                                protocol: window.location.protocol,
                                errorInfo
                            }
                        });
                        // Throwing ensures the caller knows it failed (if they await it)
                        throw new Error("AntivirusBlocking");
                    } else {
                        void logErrorAction({
                            description: `[Push-Keep] SW Registration Auto Blocked by Antivirus (Followup, if happens again&again for same user we'll need to automatically hide the bell and suppress the LogError)`,
                            schoolId: schoolId,
                            user: teacherId,
                            metadata: {
                                isManual,
                                protocol: window.location.protocol,
                                errorInfo,
                                suppressedAlert: true
                            }
                        });
                        return;
                    }
                }

                void logErrorAction({
                    description: `[Push Hook] Service Worker Registration Failed: ${errorMessage}`,
                    schoolId: schoolId,
                    user: teacherId,
                    metadata: {
                        isManual,
                        protocol: window.location.protocol, // Must be https or localhost
                        errorInfo
                    }
                });
                throw swError; // Rethrow to go to outer catch
            }

            // 2. Check permission
            step = "2: check-permission";
            let currentPermission = Notification.permission;
            if (currentPermission !== "granted") {
                if (!isManual) {
                    return;
                }
                step = "2a: request-permission";
                currentPermission = await Notification.requestPermission();
                setPermission(currentPermission);
            }

            if (currentPermission !== "granted") {
                void logErrorAction({
                    description: `[Push-Keep] User clicked Bell but did not grant permission and did not click Allow`,
                    schoolId: schoolId,
                    user: teacherId,
                    metadata: { permission: currentPermission, isManual }
                });
                return;
            }

            step = "3: get-vapid-key";
            const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
            if (!vapidKey) {
                void logErrorAction({
                    description: `[Push Hook] VAPID public key not found (Step: ${step})`,
                    schoolId: schoolId,
                    user: teacherId
                });
                return;
            }

            step = "4: check-existing-sub";
            const existingSub = await registration.pushManager.getSubscription();
            if (existingSub) {
                setSubscription(existingSub);
                step = "4a: save-existing";
                await saveSubscription(existingSub, schoolId, teacherId);
                return;
            }

            step = "5: convert-key";
            let applicationServerKey: Uint8Array;
            try {
                applicationServerKey = urlBase64ToUint8Array(vapidKey);
            } catch (e: any) {
                void logErrorAction({
                    description: `[Push Hook] invalid VAPID key (Step: ${step}): ${e.message}`,
                    schoolId: schoolId,
                    user: teacherId,
                    metadata: { vapidKeyLength: vapidKey.length }
                });
                return;
            }

            step = "6: subscribe-attempt";
            try {
                // Ensure service worker is active before subscribing
                await navigator.serviceWorker.ready;

                const newSub = await registration.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: applicationServerKey as any
                });
                setSubscription(newSub);
                step = "7: save-new-sub";
                await saveSubscription(newSub, schoolId, teacherId);

            } catch (subError: any) {
                void logErrorAction({
                    description: `[Push Hook] Subscription failed (Step: ${step}): ${subError.message}`,
                    schoolId: schoolId,
                    user: teacherId,
                    metadata: {
                        name: subError.name,
                        message: subError.message,
                        code: subError.code,
                        permission: Notification.permission
                    }
                });
                throw subError;
            }

        } catch (error) {
            // If it's the antivirus error we already handled logging (or suppression) above.
            if ((error instanceof Error && error.message === "AntivirusBlocking")) {
                throw error;
            }

            void logErrorAction({
                description: `[Push Hook] Error subscribing (Step: ${step}): ${error instanceof Error ? error.message : String(error)}`,
                schoolId: schoolId,
                user: teacherId,
                metadata: {
                    error: error instanceof Error ? { name: error.name, message: error.message } : error,
                    isManual
                }
            });
            throw error;
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

    return { registerAndSubscribe, subscription, permission, isSupported, showIcon, isBlockedByAntivirus };
}
