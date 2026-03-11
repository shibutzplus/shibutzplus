import { useEffect, useRef, RefObject } from "react";

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
    const mouseDownInsideRef = useRef(false);

    useEffect(() => {
        if (!enabled) return;

        const handleMouseDown = (event: MouseEvent | TouchEvent) => {
            // Track whether mousedown started inside the ref
            mouseDownInsideRef.current = !!(ref.current && ref.current.contains(event.target as Node));
        };

        const handleMouseUp = (event: MouseEvent | TouchEvent) => {
            // Only trigger handler if mousedown also started outside
            if (mouseDownInsideRef.current) {
                mouseDownInsideRef.current = false;
                return;
            }
            if (!ref.current || ref.current.contains(event.target as Node)) {
                return;
            }
            handler(event);
        };

        document.addEventListener("mousedown", handleMouseDown);
        document.addEventListener("mouseup", handleMouseUp);
        document.addEventListener("touchstart", handleMouseDown);
        document.addEventListener("touchend", handleMouseUp);

        return () => {
            document.removeEventListener("mousedown", handleMouseDown);
            document.removeEventListener("mouseup", handleMouseUp);
            document.removeEventListener("touchstart", handleMouseDown);
            document.removeEventListener("touchend", handleMouseUp);
        };
    }, [ref, handler, enabled]);
};

