import { useEffect, RefObject, useCallback } from "react";

/**
 * Custom hook that makes a header element sticky within its scrollable container.
 * The header will stick to the top of its column when scrolling.
 * 
 * @param headerRef - React ref to the header element
 * @param options - Optional configuration
 */
export const useStickyHeader = <T extends HTMLElement>(
    headerRef: RefObject<T | null>,
    options?: {
        /** Offset from top in pixels (default: 0) */
        topOffset?: number;
        /** Enable/disable the sticky behavior (default: true) */
        enabled?: boolean;
    }
) => {
    const { topOffset = 0, enabled = true } = options || {};

    // Memoize the scroll container finder to avoid recreating on every render
    const findScrollContainer = useCallback((element: HTMLElement): HTMLElement => {
        let current = element.parentElement;
        while (current) {
            const { overflow, overflowY } = window.getComputedStyle(current);
            if (
                overflow === 'scroll' || 
                overflow === 'auto' || 
                overflowY === 'scroll' || 
                overflowY === 'auto'
            ) {
                return current;
            }
            current = current.parentElement;
        }
        return document.documentElement;
    }, []);

    useEffect(() => {
        if (!enabled) return;

        const header = headerRef.current;
        if (!header) return;

        const scrollContainer = findScrollContainer(header);
        const column = header.parentElement;

        if (!column) return;

        let ticking = false;
        let lastScrollTop = -1;

        const updatePosition = () => {
            const scrollTop = scrollContainer.scrollTop;

            // Skip update if scroll position hasn't changed
            if (scrollTop === lastScrollTop) {
                ticking = false;
                return;
            }
            lastScrollTop = scrollTop;

            const columnTop = column.offsetTop;
            const columnHeight = column.offsetHeight;
            const headerHeight = header.offsetHeight;

            // Calculate the new top position with optional offset
            let newTop = scrollTop - columnTop + topOffset;

            // Clamp the value to keep header within column bounds
            newTop = Math.max(0, Math.min(newTop, columnHeight - headerHeight));

            // Use transform for GPU-accelerated performance
            header.style.transform = `translate3d(0, ${newTop}px, 0)`;
            ticking = false;
        };

        const onScroll = () => {
            if (!ticking) {
                requestAnimationFrame(updatePosition);
                ticking = true;
            }
        };

        // Use passive listener for better scroll performance
        scrollContainer.addEventListener("scroll", onScroll, { passive: true });
        
        // Initial position calculation
        updatePosition();

        return () => {
            scrollContainer.removeEventListener("scroll", onScroll);
            // Reset transform on cleanup
            if (header) {
                header.style.transform = '';
            }
        };
    }, [headerRef, findScrollContainer, topOffset, enabled]);
};
