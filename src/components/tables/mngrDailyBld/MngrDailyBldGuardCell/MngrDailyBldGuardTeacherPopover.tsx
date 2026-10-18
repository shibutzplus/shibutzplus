"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import styles from "./MngrDailyBldGuardTeacherPopover.module.css";
import { useMainContext } from "@/context/MainContext";
import { useDailyTableContext } from "@/context/DailyTableContext";
import { successToast } from "@/lib/toast";
import messages from "@/resources/messages";
import { getDayNumberByDateString } from "@/utils/time";
import Icons from "@/style/icons";

interface MngrDailyBldGuardTeacherPopoverProps {
    onConfirm: (selectedTeacherIds: string[], locations: Record<string, string>) => void;
    onCancel: () => void;
    anchorRect: DOMRect | null;
    hour: number;
    locationText?: string;
    initialSelectedTeacherIds: string[];
    initialLocations?: Record<string, string>;
}

const normalize = (str: string) => str.trim().replace(/\s+/g, " ").toLowerCase();

const MngrDailyBldGuardTeacherPopover: React.FC<MngrDailyBldGuardTeacherPopoverProps> = ({
    onConfirm,
    onCancel,
    anchorRect,
    hour,
    locationText,
    initialSelectedTeacherIds,
    initialLocations = {},
}) => {
    const { teachers } = useMainContext();
    const { mapAvailableTeachers, selectedDate } = useDailyTableContext();
    const [mounted, setMounted] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [isInputFocused, setIsInputFocused] = useState(false);
    const [selectedTeacherIds, setSelectedTeacherIds] = useState<string[]>(initialSelectedTeacherIds);
    const [locations, setLocations] = useState<Record<string, string>>(initialLocations);

    const inputRef = useRef<HTMLInputElement>(null);
    const locationInputRefs = useRef<Map<string, HTMLInputElement>>(new Map());

    // Set of teacher IDs scheduled to teach on selected date
    const teachersTeachingTodayIds = useMemo(() => {
        const ids = new Set<string>();
        if (!selectedDate || !mapAvailableTeachers) return ids;
        const dayNumber = getDayNumberByDateString(selectedDate);
        const dayMap = mapAvailableTeachers[dayNumber];
        if (!dayMap) return ids;

        Object.values(dayMap).forEach((hourTeachers) => {
            hourTeachers.forEach((id) => ids.add(id));
        });

        return ids;
    }, [mapAvailableTeachers, selectedDate]);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Autofocus search on desktop
    useEffect(() => {
        const isMobile = typeof window !== "undefined" && window.innerWidth <= 768;
        if (!isMobile) {
            const timer = setTimeout(() => {
                inputRef.current?.focus();
            }, 40);
            return () => clearTimeout(timer);
        }
    }, []);

    // Close on Escape key (Cancel)
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                onCancel();
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [onCancel]);

    // Desktop positioning
    const desktopStyle = useMemo((): React.CSSProperties => {
        if (typeof window === "undefined" || !anchorRect) return {};
        if (window.innerWidth <= 768) return {};

        const width = 350;
        const padding = 12;

        const spaceBelow = window.innerHeight - anchorRect.bottom - padding;
        const spaceAbove = anchorRect.top - padding;

        const style: React.CSSProperties = {};

        if (spaceBelow >= 240 || spaceBelow >= spaceAbove) {
            style.top = `${Math.round(anchorRect.bottom + 6)}px`;
            style.maxHeight = `${Math.min(440, Math.max(200, spaceBelow - 6))}px`;
        } else {
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

    // Active teachers sorted alphabetically
    const activeTeachers = useMemo(() => {
        if (!teachers) return [];
        return [...teachers]
            .filter(t => t.isActive !== false)
            .sort((a, b) => a.name.localeCompare(b.name, "he"));
    }, [teachers]);

    // Filter teachers by search query
    const filteredTeachers = useMemo(() => {
        const query = normalize(searchQuery);
        if (!query) return activeTeachers;
        return activeTeachers.filter(t => normalize(t.name).includes(query));
    }, [activeTeachers, searchQuery]);

    const selectedSet = useMemo(() => new Set(selectedTeacherIds), [selectedTeacherIds]);

    const handleToggleTeacher = (teacherId: string) => {
        const isSelected = selectedTeacherIds.includes(teacherId);

        if (isSelected) {
            setSelectedTeacherIds((prev) => prev.filter((id) => id !== teacherId));
        } else {
            // If teacher does not teach today, notify with subtle toast
            if (teachersTeachingTodayIds.size > 0 && !teachersTeachingTodayIds.has(teacherId)) {
                const teacherName = teachers?.find((t) => t.id === teacherId)?.name;
                if (teacherName) {
                    successToast(messages.dailySchedule.teacherNotTeachingToday(teacherName), 5000);
                }
            }

            // Focus newly selected teacher's location input on desktop only
            const isMobile = typeof window !== "undefined" && window.innerWidth <= 768;
            if (!isMobile) {
                setTimeout(() => {
                    locationInputRefs.current.get(teacherId)?.focus();
                }, 50);
            }

            setSelectedTeacherIds((prev) => [...prev, teacherId]);
        }
    };

    const handleLocationChange = (teacherId: string, val: string) => {
        setLocations((prev) => ({
            ...prev,
            [teacherId]: val.slice(0, 18),
        }));
    };

    const handleClearAll = () => {
        setSelectedTeacherIds([]);
        setLocations({});
    };

    const handleConfirm = () => {
        const cleanedLocations: Record<string, string> = {};
        selectedTeacherIds.forEach((id) => {
            const loc = locations[id]?.trim();
            if (loc) {
                cleanedLocations[id] = loc;
            }
        });
        onConfirm(selectedTeacherIds, cleanedLocations);
    };

    if (!mounted) return null;

    return createPortal(
        <>
            <div className={styles.backdrop} onClick={onCancel} />
            <div
                className={`${styles.popover} ${isInputFocused ? styles.popoverSearchFocused : ""}`}
                style={desktopStyle}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Title Bar */}
                <div className={styles.titleBar}>
                    <div className={styles.titleContent}>
                        <span className={styles.titleIcon}>
                            <Icons.guard width={18} height={18} />
                        </span>
                        <span className={styles.titleText}>
                            {locationText ? locationText : `תורנות שעה ${hour}`}
                        </span>
                    </div>
                    <button
                        className={styles.titleCloseButton}
                        onClick={onCancel}
                        title="ביטול"
                        type="button"
                    >
                        <Icons.close width={16} height={16} />
                    </button>
                </div>

                {/* Search Box */}
                <div className={styles.searchContainer}>
                    <span className={styles.searchIcon}>
                        <Icons.search width={15} height={15} />
                    </span>
                    <input
                        ref={inputRef}
                        type="text"
                        className={styles.searchInput}
                        placeholder="חיפוש מורה..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onFocus={() => setIsInputFocused(true)}
                        onBlur={() => setIsInputFocused(false)}
                    />
                    {searchQuery && (
                        <button
                            className={styles.clearSearchBtn}
                            onClick={() => setSearchQuery("")}
                            type="button"
                        >
                            <Icons.close width={14} height={14} />
                        </button>
                    )}
                </div>

                {/* Status Bar */}
                <div className={styles.statusBar}>
                    <span className={styles.selectedCount}>
                        {selectedTeacherIds.length === 0
                            ? "לא נבחרו מורים"
                            : `${selectedTeacherIds.length} מורים נבחרו`}
                    </span>
                    {selectedTeacherIds.length > 0 && (
                        <button
                            className={styles.clearAllBtn}
                            onClick={handleClearAll}
                            type="button"
                        >
                            נקה הכל
                        </button>
                    )}
                </div>

                {/* Teacher List with Checkboxes and Location Inputs */}
                <div className={styles.teacherList}>
                    {filteredTeachers.length === 0 ? (
                        <div className={styles.emptyResults}>לא נמצאו מורים מתאימים</div>
                    ) : (
                        filteredTeachers.map((teacher) => {
                            const isSelected = selectedSet.has(teacher.id);
                            return (
                                <div
                                    key={teacher.id}
                                    className={`${styles.teacherItem} ${isSelected ? styles.teacherItemSelected : ""}`}
                                    onClick={() => handleToggleTeacher(teacher.id)}
                                >
                                    <div className={styles.teacherMain}>
                                        <div
                                            className={`${styles.checkbox} ${isSelected ? styles.checkboxChecked : ""}`}
                                        >
                                            {isSelected && (
                                                <svg
                                                    className={styles.checkboxCheckIcon}
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="3.5"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                >
                                                    <polyline points="20 6 9 17 4 12" />
                                                </svg>
                                            )}
                                        </div>
                                        <span className={styles.teacherName}>{teacher.name}</span>
                                    </div>

                                    {isSelected && (
                                        <div
                                            className={styles.locationInputWrapper}
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <input
                                                ref={(el) => {
                                                    if (el) locationInputRefs.current.set(teacher.id, el);
                                                    else locationInputRefs.current.delete(teacher.id);
                                                }}
                                                type="text"
                                                className={styles.locationInput}
                                                placeholder="מיקום (לא חובה)..."
                                                maxLength={18}
                                                value={locations[teacher.id] || ""}
                                                onChange={(e) => handleLocationChange(teacher.id, e.target.value)}
                                                onFocus={() => setIsInputFocused(true)}
                                                onBlur={() => setIsInputFocused(false)}
                                                onKeyDown={(e) => {
                                                    if (e.key === "Enter") {
                                                        e.currentTarget.blur();
                                                    }
                                                }}
                                            />
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Footer */}
                <div className={styles.footer}>
                    <button
                        className={styles.doneBtn}
                        onClick={handleConfirm}
                        type="button"
                    >
                        אישור
                    </button>
                </div>
            </div>
        </>,
        document.body,
    );
};

export default MngrDailyBldGuardTeacherPopover;
