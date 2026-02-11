/**
 * Custom Hook: usePushNotifications
 *
 * Purpose: Handles the client-side logic for Web Push Notifications.
 * Functionality:
 * 1. Checks if the browser supports Service Workers and Push API.
 * 2. Registers the Service Worker (`sw.js`).
 * 3. Requests notification permissions from the user.
 * 4. Subscribes the device to the Push Manager using the VAPID public key.
 * 5. Sends the subscription details (endpoint, keys) to the backend API to be saved in the DB.
 *
 * Usage: Used in the public teacher portal (layout) to automatically subscribe teachers when they visit.
 */
"use client";

import { useState } from "react";
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

    const registerAndSubscribe = async (schoolId: string, teacherId?: string) => {
        if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
            console.log("Push notifications not supported");
            return;
        }

        try {
            // 1. Register Service Worker
            const registration = await navigator.serviceWorker.register("/sw.js");

            // 2. Check permission
            const permission = await Notification.requestPermission();
            if (permission !== "granted") {
                console.log("Notification permission not granted");
                return;
            }

            // 3. Subscribe
            const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
            if (!vapidKey) {
                void logErrorAction({ description: "VAPID public key not found", schoolId: "Push Notifications Hook" });
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
                description: `Error subscribing to push notifications: ${error instanceof Error ? error.message : String(error)}`,
                schoolId: "Push Notifications Hook"
            });
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
                description: `Failed to save subscription to server: ${err instanceof Error ? err.message : String(err)}`,
                schoolId: "Push Notifications Hook"
            });
        }
    };

    return { registerAndSubscribe, subscription };
}
