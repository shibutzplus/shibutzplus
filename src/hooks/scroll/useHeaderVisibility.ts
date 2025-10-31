import { useEffect, useRef, useState } from "react";

/**
 * Hook that detects when DailyTeacherHeader components scroll out of view
 * Uses the existing trigger div in DailyTable to detect visibility
 */
const useHeaderVisibility = () => {
    const [isVisible, setIsVisible] = useState(true);
    const observerRef = useRef<IntersectionObserver | null>(null);

    useEffect(() => {
        // Create intersection observer
        observerRef.current = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    const newVisibility = entry.isIntersecting;
                    if (newVisibility !== isVisible) {
                        setIsVisible(newVisibility);
                    }
                });
            },
            {
                // Trigger when element enters/exits viewport
                rootMargin: "0px",
                threshold: 0
            }
        );

        // Find and observe the existing trigger element
        const findAndObserveTrigger = () => {
            const triggerElement = document.querySelector('[data-header-trigger="true"]');
            if (triggerElement && observerRef.current) {
                observerRef.current.observe(triggerElement);
                return true;
            }
            return false;
        };

        // Try to find the trigger element, retry if not found
        if (!findAndObserveTrigger()) {
            const retryInterval = setInterval(() => {
                if (findAndObserveTrigger()) {
                    clearInterval(retryInterval);
                }
            }, 100);

            // Clear interval after 5 seconds to avoid infinite retry
            setTimeout(() => clearInterval(retryInterval), 5000);
        }

        return () => {
            observerRef.current?.disconnect();
        };
    }, [isVisible]);

    return { isVisible };
};

export default useHeaderVisibility;
