"use client";

import React, { useState, useRef, useEffect } from "react";
import styles from "./CleanDropdownSelect.module.css";

export type CleanDropdownOption = {
    label: string;
    value: string;
};

export type CleanDropdownSelectProps = {
    value: string;
    options: CleanDropdownOption[];
    onChange: (value: string) => void;
    className?: string;
    disabled?: boolean;
};

const CleanDropdownSelect: React.FC<CleanDropdownSelectProps> = ({
    value,
    options = [],
    onChange,
    className,
    disabled = false,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const hasMultipleOptions = options.length > 1 && !disabled;
    const currentOption = options.find((opt) => opt.value === value) || options[0];
    const displayLabel = currentOption ? currentOption.label : "";

    useEffect(() => {
        if (!isOpen) return;

        const handleClickOutside = (event: MouseEvent | TouchEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        document.addEventListener("touchstart", handleClickOutside);
        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("touchstart", handleClickOutside);
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [isOpen]);

    const handleSelect = (optionValue: string) => {
        setIsOpen(false);
        if (optionValue !== value) {
            onChange(optionValue);
        }
    };

    // When there are no multiple options or disabled: render clean static label without buttons/icons
    if (!hasMultipleOptions) {
        return (
            <div className={`${styles.staticLabel} ${className || ""}`}>
                {displayLabel}
            </div>
        );
    }

    return (
        <div ref={containerRef} className={`${styles.container} ${className || ""}`}>
            <button
                type="button"
                className={styles.triggerButton}
                onClick={() => setIsOpen((prev) => !prev)}
                aria-haspopup="listbox"
                aria-expanded={isOpen}
            >
                <span>{displayLabel}</span>
                <span className={`${styles.arrowIcon} ${isOpen ? styles.arrowOpen : ""}`}>
                    <svg
                        width="10"
                        height="6"
                        viewBox="0 0 10 6"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        aria-hidden="true"
                    >
                        <path
                            d="M1 1L5 5L9 1"
                            stroke="currentColor"
                            strokeWidth="1.6"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                </span>
            </button>

            {isOpen && (
                <ul className={styles.dropdownMenu} role="listbox">
                    {options.map((opt) => {
                        const isSelected = opt.value === value;
                        return (
                            <li
                                key={opt.value}
                                role="option"
                                aria-selected={isSelected}
                                className={`${styles.menuItem} ${isSelected ? styles.menuItemActive : ""}`}
                                onClick={() => handleSelect(opt.value)}
                            >
                                <span>{opt.label}</span>
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
};

export default CleanDropdownSelect;
