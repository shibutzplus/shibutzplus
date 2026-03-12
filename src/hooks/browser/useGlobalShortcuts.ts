"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { NAV_LINK_GROUPS } from "@/resources/navigation";

/**
 * Hook to handle global keyboard shortcuts for navigation
 */
export const useGlobalShortcuts = () => {
    const router = useRouter();

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            // Check if the target is an input or textarea to avoid triggering shortcuts while typing
            const target = event.target as HTMLElement;
            if (
                target.tagName === "INPUT" ||
                target.tagName === "TEXTAREA" ||
                target.isContentEditable
            ) {
                return;
            }

            // Find all links with shortcuts
            const allLinks = NAV_LINK_GROUPS.flatMap(group => group.links);
            const shortcutLinks = allLinks.filter(link => link.shortcut);

            for (const link of shortcutLinks) {
                const shortcut = link.shortcut!;
                const parts = shortcut.split("+");
                
                const ctrlRequired = parts.includes("Ctrl");
                const altRequired = parts.includes("Alt");
                const shiftRequired = parts.includes("Shift");
                const key = parts[parts.length - 1];

                const ctrlPressed = event.ctrlKey || event.metaKey; // Support Meta for Mac
                const altPressed = event.altKey;
                const shiftPressed = event.shiftKey;

                if (
                    ctrlPressed === ctrlRequired &&
                    altPressed === altRequired &&
                    shiftPressed === shiftRequired &&
                    event.key.toLowerCase() === key.toLowerCase()
                ) {
                    event.preventDefault();
                    router.push(link.p);
                }
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [router]);
};
