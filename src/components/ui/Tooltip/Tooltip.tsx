import React, { useState, useRef, useEffect } from "react";
import { useClickOutside } from "@/hooks/useClickOutside";
import styles from "./Tooltip.module.css";

type TooltipTrigger = "hover" | "click" | "scroll";

type TooltipProps = {
    content: string;
    children: React.ReactNode;
    on?: TooltipTrigger[];
};

const Tooltip: React.FC<TooltipProps> = ({ content, children, on = ["click", "scroll"] }) => {
    const [isVisible, setIsVisible] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const hasTrigger = (trigger: TooltipTrigger) => on.includes(trigger);

    const showTooltip = () => {
        if (hasTrigger("hover")) {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            setIsVisible(true);
        }
    };

    const hideTooltip = () => {
        if (hasTrigger("hover")) {
            timeoutRef.current = setTimeout(() => {
                setIsVisible(false);
            }, 100);
        }
    };

    const handleClick = (e: React.MouseEvent) => {
        if (hasTrigger("click")) {
            e.stopPropagation();
            setIsVisible(!isVisible);
        }
    };

    useClickOutside(
        containerRef,
        () => setIsVisible(false),
        isVisible && hasTrigger("click")
    );

    useEffect(() => {
        const handleScroll = () => {
            setIsVisible(false);
        };

        if (isVisible) {
            if (hasTrigger("scroll")) {
                window.addEventListener("scroll", handleScroll, { capture: true });
            }
        }

        return () => {
            window.removeEventListener("scroll", handleScroll, { capture: true });
        };
    }, [isVisible, on]);

    return (
        <div
            className={styles.tooltipContainer}
            ref={containerRef}
            onClick={handleClick}
            onMouseEnter={showTooltip}
            onMouseLeave={hideTooltip}
            style={{ cursor: hasTrigger("click") ? "pointer" : "default" }}
        >
            {children}
            {isVisible && <div className={styles.tooltipContent}>{content}</div>}
        </div>
    );
};

export default Tooltip;
