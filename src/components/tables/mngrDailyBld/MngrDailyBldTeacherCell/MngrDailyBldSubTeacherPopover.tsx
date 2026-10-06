"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import styles from "./MngrDailyBldSubTeacherPopover.module.css";
import { GroupOption } from "@/models/types";
import Icons from "@/style/icons";

const parseTeacherLabel = (label: string) => {
    const match = label.match(/^(.*?)(?:\s*\((.*)\))?$/);
    if (!match || !match[2]) {
        return { name: label, detail: "" };
    }
    return { name: match[1].trim(), detail: match[2].trim() };
};

const normalize = (str: string) => str.trim().replace(/\s+/g, " ").toLowerCase();

interface MngrDailyBldSubTeacherPopoverProps {
    onClose: () => void;
    anchorRect: DOMRect | null;
    hour?: number | string;
    classNameText?: string;
    subjectText?: string;
    selectedSubTeacher?: string;
    groups: GroupOption[];
    onSelectTeacher: (teacherId: string) => void;
    onCreateEvent: (eventText: string) => void;
}

// Rendered conditionally by the parent - mounting == opening
const MngrDailyBldSubTeacherPopover: React.FC<MngrDailyBldSubTeacherPopoverProps> = ({
    onClose,
    anchorRect,
    hour,
    classNameText,
    subjectText,
    selectedSubTeacher,
    groups,
    onSelectTeacher,
    onCreateEvent,
}) => {
    const [mounted, setMounted] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [expandedGroup, setExpandedGroup] = useState<string | null>(null);
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const listRef = useRef<HTMLDivElement>(null);
    const groupRefs = useRef<Record<string, HTMLDivElement | null>>({});

    useEffect(() => {
        setMounted(true);
    }, []);

    // Autofocus on open:
    // Desktop: autofocus search immediately for instant typing
    // Mobile: do not autofocus to prevent jarring viewport resize and virtual keyboard covering the screen
    useEffect(() => {
        const isMobile = typeof window !== "undefined" && window.innerWidth <= 768;
        if (!isMobile) {
            const timer = setTimeout(() => {
                inputRef.current?.focus();
            }, 40);
            return () => clearTimeout(timer);
        }
    }, []);

    // Close on Escape key
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                onClose();
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [onClose]);

    // Filter groups: ALWAYS exclude groups with 0 options
    // Same normalization as exact-match detection, so both always agree
    const trimmedQuery = normalize(searchQuery);

    const filteredGroups = useMemo(() => {
        const availableGroups = groups.filter((g) => g.options && g.options.length > 0);
        if (!trimmedQuery) return availableGroups;
        return availableGroups
            .map((group) => ({
                ...group,
                options: group.options.filter((opt) =>
                    normalize(opt.label).includes(trimmedQuery),
                ),
            }))
            .filter((group) => group.options.length > 0);
    }, [groups, trimmedQuery]);

    const totalMatchingTeachers = useMemo(() => {
        return filteredGroups.reduce((acc, g) => acc + g.options.length, 0);
    }, [filteredGroups]);

    // Desktop positioning
    const desktopStyle = useMemo((): React.CSSProperties => {
        if (typeof window === "undefined" || !anchorRect) return {};
        if (window.innerWidth <= 768) return {};

        const width = 350;
        const padding = 12;

        const spaceBelow = window.innerHeight - anchorRect.bottom - padding;
        const spaceAbove = anchorRect.top - padding;

        const style: React.CSSProperties = {};

        // If there's enough space below (at least 240px) or more space below than above:
        if (spaceBelow >= 240 || spaceBelow >= spaceAbove) {
            style.top = `${Math.round(anchorRect.bottom + 6)}px`;
            style.maxHeight = `${Math.min(440, Math.max(200, spaceBelow - 6))}px`;
        } else {
            // Anchor directly to the top edge of the cell!
            // The bottom of the popover sits 6px above anchorRect.top
            const bottomDist = window.innerHeight - anchorRect.top + 6;
            style.bottom = `${Math.round(bottomDist)}px`;
            style.maxHeight = `${Math.min(440, Math.max(200, spaceAbove - 6))}px`;
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

        return style;
    }, [anchorRect]);

    // Check if the current search query is an EXACT match to any existing teacher's name or label
    const exactMatchTeacher = useMemo(() => {
        const normalizedQuery = trimmedQuery;
        if (!normalizedQuery) return null;
        for (const group of groups) {
            for (const opt of group.options) {
                const { name } = parseTeacherLabel(opt.label);
                if (
                    normalize(name) === normalizedQuery ||
                    normalize(opt.label) === normalizedQuery
                ) {
                    return opt;
                }
            }
        }
        return null;
    }, [groups, trimmedQuery]);

    const isExactMatch = !!exactMatchTeacher;

    const handleCreateEvent = () => {
        if (!trimmedQuery) return;
        onCreateEvent(searchQuery.trim());
        onClose();
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            e.preventDefault();
            // If the query is an exact match to a teacher, select that teacher
            if (exactMatchTeacher) {
                onSelectTeacher(exactMatchTeacher.value);
                onClose();
            } else if (filteredGroups.length === 0 && trimmedQuery) {
                // If no teachers match at all, assign as free text
                handleCreateEvent();
            } else if (totalMatchingTeachers === 1 && filteredGroups.length === 1) {
                // If exactly 1 teacher matches partially, select that teacher
                onSelectTeacher(filteredGroups[0].options[0].value);
                onClose();
            }
        }
    };

    const toggleGroup = (groupLabel: string) => {
        setExpandedGroup((prev) => {
            const next = prev === groupLabel ? null : groupLabel;
            if (next) {
                // Smoothly scroll the opened category to the top of the container
                setTimeout(() => {
                    const headerEl = groupRefs.current[groupLabel];
                    const listEl = listRef.current;
                    if (headerEl && listEl) {
                        listEl.scrollTo({ top: headerEl.offsetTop, behavior: "smooth" });
                    }
                }, 60);
            }
            return next;
        });
    };

    if (!mounted) return null;

    return createPortal(
        <>
            {/* Backdrop */}
            <div className={styles.backdrop} onClick={onClose} />

            {/* Popover Window */}
            <div
                className={`${styles.popover} ${isSearchFocused ? styles.popoverSearchFocused : ""}`}
                style={desktopStyle}
                role="dialog"
                aria-modal="true"
                aria-label="שיבוץ מורה ממלא מקום"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Title Bar (Solid pleasant gray header) */}
                <div className={styles.titleBar}>
                    <div className={styles.titleContent}>
                        <span className={styles.titleDetails}>
                            {hour !== undefined && <span>שעה {hour}</span>}
                            {hour !== undefined && classNameText && <span>: </span>}
                            {classNameText && <span className={styles.titleClass}>{classNameText}</span>}
                            {subjectText && (
                                <span className={styles.titleSubject}>
                                    {" "}{subjectText.startsWith("(") ? subjectText : `(${subjectText})`}
                                </span>
                            )}
                        </span>
                    </div>

                    <button
                        type="button"
                        className={styles.titleCloseButton}
                        onClick={onClose}
                        title="סגור"
                        aria-label="סגור"
                    >
                        <Icons.close size={18} />
                    </button>
                </div>

                {/* Integrated Flat Search Input */}
                <div className={styles.searchContainer}>
                    {searchQuery ? (
                        <button
                            type="button"
                            className={styles.searchActionBtn}
                            onClick={() => {
                                setSearchQuery("");
                                inputRef.current?.focus();
                            }}
                            title="נקה חיפוש"
                            aria-label="נקה חיפוש"
                        >
                            <Icons.close size={14} />
                        </button>
                    ) : (
                        <span className={styles.searchIconWrapper}>
                            <Icons.search size={14} />
                        </span>
                    )}
                    <input
                        ref={inputRef}
                        type="text"
                        className={styles.searchInput}
                        placeholder="חיפוש מורה או הקלדה חופשית..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onFocus={() => setIsSearchFocused(true)}
                        onBlur={() => setIsSearchFocused(false)}
                        onKeyDown={handleKeyDown}
                    />
                </div>

                {/* Exclusive Accordion Body */}
                <div ref={listRef} className={styles.accordionList}>
                    {filteredGroups.length === 0 ? (
                        trimmedQuery ? (
                            <button
                                type="button"
                                className={`${styles.flatCreateRow} ${styles.flatCreateRowEmpty}`}
                                onClick={handleCreateEvent}
                            >
                                <span className={styles.flatCreateIcon}>
                                    <Icons.plus size={13} />
                                </span>
                                <span className={styles.flatCreateText}>
                                    {`שיבוץ "${searchQuery.trim()}" כטקסט חופשי (Enter)`}
                                </span>
                            </button>
                        ) : (
                            <div className={styles.emptyState}>אין מורים להצגה</div>
                        )
                    ) : (
                        <>
                            {filteredGroups.map((group) => {
                                // If searching, keep all matching groups open; otherwise only the selected one
                                const isExpanded = trimmedQuery
                                    ? true
                                    : expandedGroup === group.label;

                                return (
                                    <div
                                        key={group.label}
                                        ref={(el) => {
                                            groupRefs.current[group.label] = el;
                                        }}
                                    >
                                        <button
                                            type="button"
                                            className={styles.groupHeader}
                                            onClick={() => toggleGroup(group.label)}
                                        >
                                            <div className={styles.groupTitle}>
                                                <span
                                                    className={`${styles.caretIcon} ${isExpanded ? styles.caretIconExpanded : ""
                                                        }`}
                                                >
                                                    <Icons.caretLeft size={12} />
                                                </span>
                                                <span>
                                                    {group.label}{" "}
                                                    <span className={styles.badgeCount}>
                                                        ({group.options.length})
                                                    </span>
                                                </span>
                                            </div>
                                        </button>

                                        {isExpanded && (
                                            <div className={styles.groupContent}>
                                                {group.options.map((opt) => {
                                                    const { name: teacherName, detail: teacherDetail } =
                                                        parseTeacherLabel(opt.label);
                                                    const isSelected =
                                                        selectedSubTeacher === opt.label ||
                                                        selectedSubTeacher === teacherName;

                                                    return (
                                                        <button
                                                            key={opt.value}
                                                            type="button"
                                                            className={`${styles.teacherItem} ${isSelected
                                                                ? styles.teacherItemActive
                                                                : ""
                                                                }`}
                                                            onClick={() => {
                                                                onSelectTeacher(opt.value);
                                                                onClose();
                                                            }}
                                                        >
                                                            <div className={styles.teacherItemText}>
                                                                <span className={styles.teacherNameText}>
                                                                    {teacherName}
                                                                </span>
                                                                {teacherDetail && (
                                                                    <span
                                                                        className={
                                                                            styles.teacherDetailBadge
                                                                        }
                                                                    >
                                                                        {teacherDetail}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            {isSelected && (
                                                                <span>✓</span>
                                                            )}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}

                            {/* Flat row at the end of the list for free text when not an exact match */}
                            {trimmedQuery && !isExactMatch && (
                                <button
                                    type="button"
                                    className={styles.flatCreateRow}
                                    onClick={handleCreateEvent}
                                >
                                    <span className={styles.flatCreateIcon}>
                                        <Icons.plus size={13} />
                                    </span>
                                    <span className={styles.flatCreateText}>
                                        {`שיבוץ "${searchQuery.trim()}" כטקסט חופשי`}
                                    </span>
                                </button>
                            )}
                        </>
                    )}
                </div>
            </div>
        </>,
        document.body,
    );
};

export default MngrDailyBldSubTeacherPopover;
