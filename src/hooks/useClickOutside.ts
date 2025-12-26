import { useEffect, RefObject } from "react";

/**
 * Hook to detect clicks outside of a specified element.
 * @param ref - The ref of the element to detect clicks outside of.
 * @param handler - Function to call when a click outside moves.
 */
export const useClickOutside = (
    ref: RefObject<HTMLElement | null>,
    handler: (event: MouseEvent | TouchEvent) => void,
    enabled: boolean = true
) => {
    useEffect(() => {
        if (!enabled) return;

        const listener = (event: MouseEvent | TouchEvent) => {
            // Do nothing if clicking ref's element or descendent elements
            if (!ref.current || ref.current.contains(event.target as Node)) {
                return;
            }
            handler(event);
        };

        document.addEventListener("mousedown", listener);
        document.addEventListener("touchstart", listener);

        return () => {
            document.removeEventListener("mousedown", listener);
            document.removeEventListener("touchstart", listener);
        };
    }, [ref, handler, enabled]);
};
