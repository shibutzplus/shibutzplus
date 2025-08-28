"use client";

import React, { useEffect, useId, useMemo, useRef, useState } from "react";
import Select from "react-select";
import styles from "./InputGroupMultiSelect.module.css";
import { GroupOption, SelectOption } from "@/models/types";
import AddToSelectBtn from "../../buttons/AddToSelectBtn/AddToSelectBtn";
import type { ActionMeta, OnChangeValue } from "react-select";
import { customStylesMulti } from "@/style/selectMultiStyle";
import { SelectMethod } from "@/models/types/actions";

export interface InputGroupMultiSelectProps {
    label?: string;
    options: GroupOption[];
    error?: string;
    id?: string;
    /** Selected values */
    value?: string[];
    onChange: (value: string[], method: SelectMethod) => void;
    placeholder?: string;
    isSearchable?: boolean;
    allowAddNew?: boolean;
    isDisabled?: boolean;
    hasBorder?: boolean;
    backgroundColor?: "white" | "transparent";
    isClearable?: boolean;
    onCreate?: (value: string) => Promise<string | undefined>;
    /** Keep menu open when selecting multiple (recommended) */
    closeMenuOnSelect?: boolean;
    /** Label for the dynamic group that holds user-created options */
    createdGroupLabel?: string;
}

const formatGroupLabel = (data: GroupOption) => (
    <div className={styles.groupStyles}>
        <span>{data.label}</span>
        <span className={styles.groupBadgeStyles}>{data.options.length}</span>
    </div>
);

const InputGroupMultiSelect: React.FC<InputGroupMultiSelectProps> = ({
    label,
    options: groupedInitial,
    error,
    id,
    value = [],
    onChange,
    placeholder = "בחר אופציה...",
    isSearchable = true,
    allowAddNew = false,
    isDisabled = false,
    hasBorder = false,
    backgroundColor = "white",
    isClearable = false,
    onCreate,
    closeMenuOnSelect = true,
    createdGroupLabel = "Custom",
}) => {
    const [groupedOptions, setGroupedOptions] = useState<GroupOption[]>(groupedInitial);
    const [selectedOptions, setSelectedOptions] = useState<SelectOption[]>([]);
    const [isMounted, setIsMounted] = useState(false);
    const selectInstanceId = useId();
    const selectRef = useRef<any>(null);

    // Keep local grouped options in sync with incoming prop, and update selectedOptions only if value or groupedOptions actually changed
    useEffect(() => {
        let changed = false;
        // Only update groupedOptions if different
        setGroupedOptions((prev) => {
            if (prev !== groupedInitial) {
                changed = true;
                return groupedInitial;
            }
            return prev;
        });
        // Only update selectedOptions if different
        if (!value || value.length === 0) {
            setSelectedOptions((prev) => (prev.length === 0 ? prev : []));
        } else {
            const all = groupedInitial.flatMap((g) => g.options);
            const mapped = value
                .map((v) => all.find((o) => o.value === v))
                .filter((x): x is SelectOption => Boolean(x));
            setSelectedOptions((prev) => {
                if (
                    prev.length !== mapped.length ||
                    prev.some((opt, idx) => opt.value !== mapped[idx].value)
                ) {
                    return mapped;
                }
                return prev;
            });
        }
    }, [groupedInitial, value]);

    useEffect(() => {
        if (!isMounted) setIsMounted(true);
    }, [isMounted]);

    const allOptions = useMemo(() => groupedOptions.flatMap((g) => g.options), [groupedOptions]);

    const handleChange = (
        opts: OnChangeValue<SelectOption, true>,
        meta: ActionMeta<SelectOption>,
    ) => {
        const next = Array.isArray(opts) ? [...opts] : [];
        setSelectedOptions(next);
        onChange(next.map((o) => o.value), meta.action);
    };

    const ensureCreatedGroup = () => {
        const idx = groupedOptions.findIndex((g) => g.label === createdGroupLabel);
        if (idx === -1) {
            setGroupedOptions((prev) => [...prev, { label: createdGroupLabel, options: [] }]);
            return groupedOptions.length; // new index will be the last
        }
        return idx;
    };

    const handleOnCreate = async (inputValue: string) => {
        const labelTrimmed = inputValue.trim();
        if (!labelTrimmed) return;

        // Prevent duplicates by label (case-insensitive) across ALL options
        const exists = allOptions.some(
            (option) => option.label.toLowerCase() === labelTrimmed.toLowerCase(),
        );

        if (!exists && allowAddNew && onCreate) {
            const valueId = await onCreate(labelTrimmed);
            if (valueId) {
                const newOption: SelectOption = { value: valueId, label: labelTrimmed };
                // Add to "created" group locally
                setGroupedOptions((prev) => {
                    const idx = prev.findIndex((g) => g.label === createdGroupLabel);
                    if (idx === -1) {
                        return [...prev, { label: createdGroupLabel, options: [newOption] }];
                    }
                    const next = [...prev];
                    next[idx] = {
                        ...next[idx],
                        options: [...next[idx].options, newOption],
                    };
                    return next;
                });
                // Add to current selection as well
                const nextSelected = [...selectedOptions, newOption];
                setSelectedOptions(nextSelected);
                onChange(nextSelected.map((o) => o.value), "create-option");
            }
        }
    };

    return (
        <div className={styles.selectContainer}>
            {label && (
                <label htmlFor={id} className={styles.label}>
                    {label}
                </label>
            )}

            <Select
                ref={selectRef}
                instanceId={selectInstanceId}
                id={id}
                isMulti
                value={selectedOptions}
                onChange={handleChange}
                options={groupedOptions}
                isSearchable={isSearchable}
                isClearable={isClearable}
                isDisabled={isDisabled}
                placeholder={placeholder}
                closeMenuOnSelect={closeMenuOnSelect}
                hideSelectedOptions={false}
                backspaceRemovesValue
                menuPortalTarget={isMounted ? document.body : null}
                menuPlacement="auto"
                formatGroupLabel={formatGroupLabel}
                noOptionsMessage={({ inputValue }) =>
                    allowAddNew && inputValue.trim() !== "" ? (
                        <AddToSelectBtn
                            onClick={() => handleOnCreate(inputValue)}
                            label={inputValue}
                        />
                    ) : (
                        <div>לא נמצאו אפשרויות</div>
                    )
                }
                onKeyDown={(e: React.KeyboardEvent) => {
                    if (
                        allowAddNew &&
                        e.key === "Enter" &&
                        typeof e.target === "object" &&
                        e.target &&
                        "value" in e.target
                    ) {
                        const inputValue = (e.target as HTMLInputElement).value;
                        if (inputValue.trim() === "") return;
                        const exists = allOptions.some(
                            (opt) => opt.label.toLowerCase() === inputValue.toLowerCase(),
                        );
                        if (!exists && inputValue.trim().length > 0) {
                            e.preventDefault();
                            handleOnCreate(inputValue);
                        }
                    }
                }}
                styles={customStylesMulti(
                    error || "",
                    hasBorder,
                    true,
                    backgroundColor,
                )}
                classNamePrefix="react-select"
            />

            {error && <p className={styles.errorText}>{error}</p>}
        </div>
    );
};

export default InputGroupMultiSelect;
