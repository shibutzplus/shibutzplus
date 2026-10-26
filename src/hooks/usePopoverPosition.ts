import React, { useMemo } from "react";

export interface PopoverPositionOptions {
    /** Popover width in pixels (defaults to 350) */
    width?: number;
    /** Horizontal alignment: "right" (RTL right-aligned with anchor) or "center" (centered on anchor). Defaults to "right" */
    align?: "right" | "center";
    /** Estimated or needed content height in pixels (used for flip decision when align is "center") */
    neededHeight?: number;
    /** Additional reactive dependencies to trigger recalculation */
    deps?: React.DependencyList;
}

const OFFSET = 6;
const MOBILE_BREAKPOINT = 768;

/**
 * Calculates responsive desktop positioning style for a popover anchored to a DOM element (table cell).
 * Handles smart vertical flipping, viewport boundary clamping, and responsive fallback.
 */
export function usePopoverPosition(
    anchorRect: DOMRect | null | undefined,
    options: PopoverPositionOptions = {}
): React.CSSProperties {
    const {
        width = 350,
        align = "right",
        neededHeight,
        deps = [],
    } = options;

    const maxHeight = align === "center" ? 520 : 440;
    const padding = align === "center" ? 16 : 12;
    const requiredHeight = neededHeight ?? (align === "center" ? 300 : 380);

    return useMemo((): React.CSSProperties => {
        if (typeof window === "undefined" || !anchorRect) return {};
        if (window.innerWidth <= MOBILE_BREAKPOINT) return {};

        const spaceBelow = window.innerHeight - anchorRect.bottom - padding;
        const spaceAbove = anchorRect.top - padding;
        const style: React.CSSProperties = {};

        if (align === "center") {
            // Horizontal: center horizontally on the cell
            const cellCenterX = anchorRect.left + anchorRect.width / 2;
            let left = cellCenterX - width / 2;
            if (left < padding) left = padding;
            if (left + width > window.innerWidth - padding) {
                left = window.innerWidth - width - padding;
            }
            style.left = `${Math.round(left)}px`;
            style.right = "auto";

            // Vertical: smart flip based on neededHeight
            let top: number;
            if (spaceBelow < requiredHeight && spaceAbove > spaceBelow) {
                top = anchorRect.top - requiredHeight - OFFSET;
                if (top < padding) top = padding;
                style.maxHeight = `${Math.min(maxHeight, window.innerHeight - top - padding)}px`;
            } else {
                top = anchorRect.top;
                if (top + requiredHeight > window.innerHeight - padding) {
                    top = Math.max(padding, window.innerHeight - requiredHeight - padding);
                }
                style.maxHeight = `${Math.min(maxHeight, window.innerHeight - top - padding)}px`;
            }
            style.top = `${Math.round(top)}px`;
        } else {
            // Vertical: flip if not enough space below and more space above
            if (spaceBelow < requiredHeight && spaceAbove > spaceBelow) {
                const bottomDist = window.innerHeight - anchorRect.top + OFFSET;
                style.bottom = `${Math.round(bottomDist)}px`;
                style.maxHeight = `${Math.min(maxHeight, Math.max(200, spaceAbove - OFFSET))}px`;
            } else {
                style.top = `${Math.round(anchorRect.bottom + OFFSET)}px`;
                style.maxHeight = `${Math.min(maxHeight, Math.max(200, spaceBelow - OFFSET))}px`;
            }

            // Horizontal (RTL): align with right edge of the cell
            let right = window.innerWidth - anchorRect.right;
            if (anchorRect.right - width < padding) {
                right = window.innerWidth - width - padding;
            }
            if (right < padding) {
                right = padding;
            }
            style.right = `${Math.round(right)}px`;
        }

        return style;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [anchorRect, width, align, neededHeight, ...deps]);
}

export default usePopoverPosition;
