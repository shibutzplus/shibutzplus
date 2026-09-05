import { useEffect, useRef, RefObject } from "react";

/** Hook to detect clicks outside of an element, ignoring ghost clicks. */
export const useClickOutside = (
    ref: RefObject<HTMLElement | null>,
    handler: (event: MouseEvent | TouchEvent) => void,
    enabled: boolean = true
) => {
    const handlerRef = useRef(handler);
    useEffect(() => { handlerRef.current = handler; }, [handler]);

    useEffect(() => {
        if (!enabled) return;

        let mouseDownWasOutside: boolean | null = null;

        const handleMouseDown = (event: MouseEvent | TouchEvent) => {
            mouseDownWasOutside = !!(ref.current && !ref.current.contains(event.target as Node));
        };

        const handleMouseUp = (event: MouseEvent | TouchEvent) => {
            if (mouseDownWasOutside !== true) {
                mouseDownWasOutside = null;
                return;
            }
            mouseDownWasOutside = null;
            if (!ref.current || ref.current.contains(event.target as Node)) return;
            handlerRef.current(event);
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
    }, [ref, enabled]);
};
