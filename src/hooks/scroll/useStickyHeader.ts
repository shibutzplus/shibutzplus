import { useEffect, RefObject } from "react";

export const useStickyHeader = <T extends HTMLElement>(headerRef: RefObject<T | null>) => {
    useEffect(() => {
        const header = headerRef.current;
        if (!header) return;

        // Find the scroll container (assuming it's the main content area)
        const scrollContainer = header.closest("main") || document.documentElement;
        const column = header.parentElement;

        if (!column) return;

        let ticking = false;

        const updatePosition = () => {
            const scrollTop = scrollContainer.scrollTop;
            const columnTop = column.offsetTop;
            const columnHeight = column.offsetHeight;
            const headerHeight = header.offsetHeight;

            // Calculate the new top position
            let newTop = scrollTop - columnTop;

            // Clamp the value
            newTop = Math.max(0, Math.min(newTop, columnHeight - headerHeight));

            // Use transform for performance (hardware acceleration)
            header.style.transform = `translate3d(0, ${newTop}px, 0)`;
            ticking = false;
        };

        const onScroll = () => {
            if (!ticking) {
                requestAnimationFrame(updatePosition);
                ticking = true;
            }
        };

        scrollContainer.addEventListener("scroll", onScroll, { passive: true });
        // Initial calculation
        updatePosition();

        return () => {
            scrollContainer.removeEventListener("scroll", onScroll);
        };
    }, [headerRef]);
};
