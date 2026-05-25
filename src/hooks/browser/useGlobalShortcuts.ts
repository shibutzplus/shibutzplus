"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import routerConfig from "@/routes";

/**
 * Hook to handle global keyboard shortcuts for navigation
 */
export const useGlobalShortcuts = () => {
    const router = useRouter();

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            // Check if the user pressed Ctrl + M (or Cmd + M on Mac)
            // event.code is 'KeyM' regardless of keyboard layout (Hebrew/English)
            const isCtrlOrMeta = event.ctrlKey || event.metaKey;
            const isKeyM =
                event.code === "KeyM" ||
                event.key.toLowerCase() === "m" ||
                event.key === "צ";

            if (isCtrlOrMeta && isKeyM && !event.altKey && !event.shiftKey) {
                event.preventDefault();
                router.push(routerConfig.annualView.p);
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [router]);
};
