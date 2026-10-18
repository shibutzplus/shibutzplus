"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import styles from "./MngrDailyBldGuardCell.module.css";
import { useDailyTableContext } from "@/context/DailyTableContext";
import { useMainContext } from "@/context/MainContext";
import { ColumnTypeValues, DailyScheduleCell } from "@/models/types/dailySchedule";
import { DEFAULT_GUARD_TITLE } from "@/models/constant/daily";
import { errorToast } from "@/lib/toast";
import messages from "@/resources/messages";
import { logErrorAction } from "@/app/actions/POST/logErrorAction";
import { usePopup } from "@/context/PopupContext";
import RecurringChoicePopup, { RecurringChoiceMode } from "@/components/popups/RecurringChoicePopup/RecurringChoicePopup";
import MngrDailyBldGuardTeacherPopover from "./MngrDailyBldGuardTeacherPopover";
import Icons from "@/style/icons";

type MngrDailyBldGuardCellProps = {
    columnId: string;
    cell: DailyScheduleCell;
};

const MngrDailyBldGuardCell: React.FC<MngrDailyBldGuardCellProps> = ({ columnId, cell }) => {
    const {
        mainDailyTable,
        addGuardCell,
        updateGuardCell,
        deleteGuardCell,
        selectedDate,
        updateRecurringFromDate,
        detachRecurringColumn,
    } = useDailyTableContext();
    const { teachers } = useMainContext();
    const { openPopup } = usePopup();

    const isRecurring = columnId.startsWith("rec_");

    // Teacher map for displaying names on chips
    const teacherMap = useMemo(() => {
        const map = new Map<string, string>();
        teachers?.forEach((t) => map.set(t.id, t.name));
        return map;
    }, [teachers]);

    const hour = cell?.hour;
    const initialLocation = cell?.event || "";
    const initialGuardTeachers = useMemo(() => {
        const ids = cell?.guardTeacherIds || [];
        if (!teachers || teachers.length === 0) return ids;
        return ids.filter((id) => teacherMap.has(id));
    }, [cell?.guardTeacherIds, teachers, teacherMap]);

    const parseGuardLocations = (instructions?: string | null): Record<string, string> => {
        if (!instructions) return {};
        try {
            const parsed = JSON.parse(instructions);
            if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
                return parsed as Record<string, string>;
            }
        } catch {
            // Ignore non-JSON legacy data
        }
        return {};
    };

    const [location, setLocation] = useState<string>(initialLocation);
    const [guardTeachers, setGuardTeachers] = useState<string[]>(initialGuardTeachers);
    const [guardLocations, setGuardLocations] = useState<Record<string, string>>(() =>
        parseGuardLocations(cell?.instructions),
    );
    const [isLoading, setIsLoading] = useState(false);
    const [isPopoverOpen, setIsPopoverOpen] = useState(false);
    const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null);

    const cellRef = useRef<HTMLDivElement>(null);
    const prevLocationRef = useRef<string>(initialLocation);
    const prevTeachersRef = useRef<string[]>(initialGuardTeachers);
    const prevLocationsRef = useRef<Record<string, string>>(guardLocations);

    // Keep local state in sync when cell data from server or sync updates
    useEffect(() => {
        setLocation(cell?.event || "");
        prevLocationRef.current = cell?.event || "";
    }, [cell?.event]);

    useEffect(() => {
        const rawTeachers = cell?.guardTeacherIds || [];
        const nextTeachers = teachers && teachers.length > 0
            ? rawTeachers.filter((id) => teacherMap.has(id))
            : rawTeachers;
        setGuardTeachers(nextTeachers);
        prevTeachersRef.current = nextTeachers;
    }, [cell?.guardTeacherIds, teachers, teacherMap]);

    useEffect(() => {
        const nextLocs = parseGuardLocations(cell?.instructions);
        setGuardLocations(nextLocs);
        prevLocationsRef.current = nextLocs;
    }, [cell?.instructions]);

    /**
     * Core save logic: saves (add / update / delete) for a specific columnId, text, teacher IDs, and locations.
     */
    const saveCellChange = async (
        activeColumnId: string,
        nextLocation: string,
        nextTeachers: string[],
        nextLocations?: Record<string, string>,
    ): Promise<boolean> => {
        try {
            setIsLoading(true);
            let cellData =
                mainDailyTable[selectedDate]?.[activeColumnId]?.[hour] ||
                mainDailyTable[selectedDate]?.[columnId]?.[hour];
            if (!cellData) return false;

            // Patch cellData if header title is missing
            const currentHeaderTitle = cellData.headerCol?.headerEvent || DEFAULT_GUARD_TITLE;
            if (!cellData.headerCol?.headerEvent) {
                cellData = {
                    ...cellData,
                    headerCol: {
                        ...(cellData.headerCol || { type: ColumnTypeValues.guard }),
                        headerEvent: currentHeaderTitle,
                        type: ColumnTypeValues.guard,
                    },
                };
            }

            const effectiveLocations = nextLocations !== undefined ? nextLocations : guardLocations;
            const cleanedLocations: Record<string, string> = {};
            nextTeachers.forEach((id) => {
                const loc = effectiveLocations[id]?.trim();
                if (loc) cleanedLocations[id] = loc;
            });
            const instructionsJson = Object.keys(cleanedLocations).length > 0
                ? JSON.stringify(cleanedLocations)
                : null;

            const existingId = cellData?.DBid;
            const isEmpty = nextLocation.trim() === "" && nextTeachers.length === 0;

            let response;
            if (isEmpty) {
                if (existingId) {
                    response = await deleteGuardCell(cellData, activeColumnId, existingId);
                } else {
                    setLocation("");
                    setGuardTeachers([]);
                    setGuardLocations({});
                    prevLocationRef.current = "";
                    prevTeachersRef.current = [];
                    prevLocationsRef.current = {};
                    return true;
                }
            } else if (existingId) {
                response = await updateGuardCell(
                    cellData,
                    activeColumnId,
                    existingId,
                    {
                        event: nextLocation,
                        guardTeacherIds: nextTeachers,
                        instructions: instructionsJson,
                    },
                );
            } else {
                response = await addGuardCell(cellData, activeColumnId, {
                    event: nextLocation,
                    guardTeacherIds: nextTeachers,
                    instructions: instructionsJson,
                });
            }

            if (response) {
                prevLocationRef.current = nextLocation;
                prevTeachersRef.current = nextTeachers;
                prevLocationsRef.current = cleanedLocations;
                setGuardLocations(cleanedLocations);
                return true;
            }

            logErrorAction({
                description: `Failed to save guard cell: response returned falsy`,
                metadata: { columnId: activeColumnId, hour, selectedDate, nextLocation, nextTeachers, cleanedLocations },
            });
            errorToast(
                existingId
                    ? messages.dailySchedule.updateError
                    : messages.dailySchedule.createError,
            );
            setLocation(prevLocationRef.current);
            setGuardTeachers(prevTeachersRef.current);
            setGuardLocations(prevLocationsRef.current);
            return false;
        } catch (err) {
            logErrorAction({
                description: `Exception in saveCellChange (guard cell): ${err instanceof Error ? err.message : String(err)}`,
                metadata: { columnId: activeColumnId, hour, selectedDate, nextLocation, nextTeachers },
            });
            errorToast(messages.dailySchedule.updateError);
            setLocation(prevLocationRef.current);
            setGuardTeachers(prevTeachersRef.current);
            setGuardLocations(prevLocationsRef.current);
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Dispatch save with recurring confirmation popup if column is recurring.
     */
    const triggerSave = async (
        nextLocation: string,
        nextTeachers: string[],
        nextLocations?: Record<string, string>,
    ) => {
        if (hour === undefined || !columnId || !selectedDate) return;

        const effectiveLocations = nextLocations !== undefined ? nextLocations : guardLocations;
        const cleanedLocations: Record<string, string> = {};
        nextTeachers.forEach((id) => {
            const loc = effectiveLocations[id]?.trim();
            if (loc) cleanedLocations[id] = loc;
        });
        const instructionsJson = Object.keys(cleanedLocations).length > 0
            ? JSON.stringify(cleanedLocations)
            : null;

        if (isRecurring) {
            const originalLoc = prevLocationRef.current;
            const originalTeachers = prevTeachersRef.current;
            const originalLocations = prevLocationsRef.current;

            openPopup(
                "recurringChoice",
                "S",
                <RecurringChoicePopup
                    text="האם לשנות את פרטי התורנות?"
                    singleLabel="רק עבור יום זה"
                    futureLabel="מעכשיו ועד סוף השנה"
                    onChoice={async (mode: RecurringChoiceMode) => {
                        if (mode === "single") {
                            const newColId = await detachRecurringColumn?.(columnId, selectedDate);
                            const targetColId = newColId || columnId;
                            await saveCellChange(targetColId, nextLocation, nextTeachers, cleanedLocations);
                        } else {
                            const isSaved = await saveCellChange(columnId, nextLocation, nextTeachers, cleanedLocations);
                            if (isSaved) {
                                await updateRecurringFromDate?.(
                                    columnId,
                                    selectedDate,
                                    {
                                        event: nextLocation,
                                        guardTeacherIds: nextTeachers,
                                        instructions: instructionsJson,
                                    },
                                    hour,
                                );
                            }
                        }
                    }}
                    onCancel={() => {
                        setLocation(originalLoc);
                        setGuardTeachers(originalTeachers);
                        setGuardLocations(originalLocations);
                    }}
                />,
            );
        } else {
            await saveCellChange(columnId, nextLocation, nextTeachers, cleanedLocations);
        }
    };

    // Location input blur
    const handleLocationBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        const val = e.target.value.trim();
        if (val === prevLocationRef.current) return;
        setLocation(val);
        triggerSave(val, guardTeachers, guardLocations);
    };

    // Location input Enter key
    const handleLocationKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            e.preventDefault();
            e.currentTarget.blur();
        }
    };

    // Open popover
    const handleOpenPopover = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (cellRef.current) {
            setAnchorRect(cellRef.current.getBoundingClientRect());
        }
        setIsPopoverOpen(true);
    };

    const validGuardTeachers = useMemo(() => {
        if (!teachers || teachers.length === 0) return guardTeachers;
        return guardTeachers.filter((id) => teacherMap.has(id));
    }, [guardTeachers, teacherMap, teachers]);

    // Remove single teacher from chip outside popover
    const handleRemoveTeacher = (e: React.MouseEvent, teacherId: string) => {
        e.stopPropagation();
        const nextTeachers = validGuardTeachers.filter((id) => id !== teacherId);
        const nextLocations = { ...guardLocations };
        delete nextLocations[teacherId];
        setGuardTeachers(nextTeachers);
        setGuardLocations(nextLocations);
        triggerSave(location, nextTeachers, nextLocations);
    };

    // Confirm popover selection (clicked "אישור")
    const handleConfirmPopover = (nextTeachers: string[], nextLocations: Record<string, string>) => {
        setIsPopoverOpen(false);
        const teachersChanged = JSON.stringify(nextTeachers) !== JSON.stringify(prevTeachersRef.current);
        const locationsChanged = JSON.stringify(nextLocations) !== JSON.stringify(prevLocationsRef.current);
        setGuardTeachers(nextTeachers);
        setGuardLocations(nextLocations);
        if (teachersChanged || locationsChanged) {
            triggerSave(location, nextTeachers, nextLocations);
        }
    };

    // Cancel popover selection (clicked "X", clicked backdrop, or pressed Escape)
    const handleCancelPopover = () => {
        setIsPopoverOpen(false);
    };

    return (
        <div className={styles.cellContent}>
            <div className={styles.innerCellContent} ref={cellRef}>
                {/* Top Section: Location / Time Input */}
                <div className={styles.topSection}>
                    <input
                        type="text"
                        className={styles.inputLocation}
                        placeholder="שעה / תיאור..."
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        onBlur={handleLocationBlur}
                        onKeyDown={handleLocationKeyDown}
                        disabled={isLoading}
                    />
                </div>

                {/* Bottom Section: Teachers List or Add Trigger */}
                <div className={styles.bottomSection}>
                    {validGuardTeachers.length === 0 ? (
                        <div
                            className={styles.teacherTrigger}
                            onClick={handleOpenPopover}
                            title="תורנים"
                        >
                            <div className={styles.teacherTriggerContent}>
                                <span className={styles.placeholderText}>תורנים</span>
                            </div>
                            <div className={styles.triggerIcons}>
                                <span className={styles.arrowTriggerIcon}>
                                    <Icons.arrowDown size={12} />
                                </span>
                            </div>
                        </div>
                    ) : (
                        <div className={styles.teachersList} onClick={handleOpenPopover}>
                            {validGuardTeachers.map((id) => {
                                const name = teacherMap.get(id);
                                if (!name) return null;
                                const teacherLoc = guardLocations[id]?.trim();
                                const fullTitle = teacherLoc ? `${name} (${teacherLoc})` : name;
                                return (
                                    <div
                                        key={id}
                                        className={styles.teacherChip}
                                        title={fullTitle}
                                    >
                                        <span className={styles.teacherChipName}>{name}</span>
                                        {teacherLoc && (
                                            <span className={styles.teacherChipLocation}>
                                                ({teacherLoc})
                                            </span>
                                        )}
                                        <button
                                            type="button"
                                            className={styles.removeTeacherBtn}
                                            onClick={(e) => handleRemoveTeacher(e, id)}
                                            title={`הסר את ${name}`}
                                        >
                                            <Icons.close width={11} height={11} />
                                        </button>
                                    </div>
                                );
                            })}
                            <button
                                type="button"
                                className={styles.addMoreChip}
                                title="הוסף עוד תורנים"
                            >
                                +
                            </button>
                        </div>
                    )}
                </div>

                {/* Teacher Multi-Select Popover */}
                {isPopoverOpen && (
                    <MngrDailyBldGuardTeacherPopover
                        onConfirm={handleConfirmPopover}
                        onCancel={handleCancelPopover}
                        anchorRect={anchorRect}
                        hour={hour}
                        locationText={location || undefined}
                        initialSelectedTeacherIds={validGuardTeachers}
                        initialLocations={guardLocations}
                    />
                )}
            </div>
        </div>
    );
};

export default MngrDailyBldGuardCell;
