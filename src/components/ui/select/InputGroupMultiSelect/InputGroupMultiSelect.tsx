"use client";

import React, { useEffect, useId, useMemo, useState } from "react";
import Select from "react-select";
import type { ActionMeta, OnChangeValue, StylesConfig } from "react-select";
import { GroupOption, SelectOption } from "@/models/types";
import { SelectMethod } from "@/models/types/actions";
import { createNewSelectOption_btnText } from "@/utils/format";
import AddToSelectBtn from "../../buttons/AddToSelectBtn/AddToSelectBtn";
import styles from "./InputGroupMultiSelect.module.css";
import SelectLayout from "../SelectLayout/SelectLayout";
import { customStyles } from "@/style/selectStyle";
import {
    BorderRadiusInput,
    DarkTextColor,
    FontSize,
    InputBackgroundColor,
    SelectBackgroundColor,
    SelectBackgroundColorHover,
} from "@/style/root";

/**
 * AnnualCell - Teacher
 */
export interface InputGroupMultiSelectProps {
    label?: string;
    options: GroupOption[];
    error?: string;
    id?: string;
    value?: string[];
    onChange: (value: string[], method: SelectMethod) => void;
    placeholder?: string;
    isSearchable?: boolean;
    isAllowAddNew?: boolean;
    isDisabled?: boolean;
    hasBorder?: boolean;
    backgroundColor?: string;
    isBold?: boolean;
    isClearable?: boolean;
    onCreate?: (value: string) => Promise<string | undefined>;
    onBeforeRemove?: (removedLabel: string | null, proceed: () => void) => void;
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
    isAllowAddNew = false,
    isDisabled = false,
    hasBorder = false,
    backgroundColor = InputBackgroundColor,
    isClearable = false,
    isBold = false,
    onCreate,
    onBeforeRemove,
}) => {
    const [groupedOptions, setGroupedOptions] = useState<GroupOption[]>(groupedInitial);
    const [selectedOptions, setSelectedOptions] = useState<SelectOption[]>([]);
    const [isMounted, setIsMounted] = useState(false);
    const selectInstanceId = useId(); // for SSR consistency

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

    const handleChange = (
        opts: OnChangeValue<SelectOption, true>,
        meta: ActionMeta<SelectOption>,
    ) => {
        const next = Array.isArray(opts) ? [...opts] : [];

        // confirm only when clicking the X on a selected chip
        if (onBeforeRemove && meta.action === "remove-value") {
            const removedLabel = ((meta as any).removedValue?.label as string | undefined) ?? null;
            return onBeforeRemove(removedLabel, () => {
                setSelectedOptions(next);
                onChange(
                    next.map((o) => o.value),
                    meta.action as SelectMethod,
                );
            });
        }

        setSelectedOptions(next);
        onChange(
            next.map((o) => o.value),
            meta.action as SelectMethod,
        );
    };

    const allOptions = useMemo(() => groupedOptions.flatMap((g) => g.options), [groupedOptions]);

    const handleOnCreate = async (inputValue: string) => {
        const labelTrimmed = inputValue.trim();
        if (!labelTrimmed) return;

        // Prevent duplicates by label (case-insensitive) across ALL options
        const exists = allOptions.some(
            (option) => option.label.toLowerCase() === labelTrimmed.toLowerCase(),
        );

        if (!exists && isAllowAddNew && onCreate) {
            const valueId = await onCreate(labelTrimmed);
            if (valueId) {
                const newOption: SelectOption = { value: valueId, label: labelTrimmed };
                // Add to "created" group locally
                setGroupedOptions((prev) => {
                    const idx = prev.findIndex((g) => g.label === "Custom");
                    if (idx === -1) {
                        return [...prev, { label: "Custom", options: [newOption] }];
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
                onChange(
                    nextSelected.map((o) => o.value),
                    "create-option",
                );
            }
        }
    };

    const baseStyles = customStyles(error || "", hasBorder, true, backgroundColor);
    const stylesOverride: StylesConfig<SelectOption, true, GroupOption> = {
        ...(baseStyles as StylesConfig<SelectOption, true, GroupOption>),
        multiValue: (provided: any) => ({
            ...provided,
            backgroundColor: InputBackgroundColor,
            borderRadius: BorderRadiusInput,
            width: "90%",
            boxSizing: "border-box",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontWeight: isBold ? 600 : 500,
        }),
        multiValueLabel: (provided: any) => ({
            ...provided,
            color: DarkTextColor,
            fontSize: FontSize,
            padding: "7px 15px",
        }),
        multiValueRemove: (provided: any) => ({
            ...provided,
            color: SelectBackgroundColor,
            cursor: "pointer",
            borderRadius: "50%",
            width: 20,
            height: 20,
            "&:hover": {
                backgroundColor: SelectBackgroundColorHover,
                color: SelectBackgroundColor,
            },
        }),
    };

    return (
        <SelectLayout resolvedId={id || ""} error={error} label={label}>
            <Select
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
                closeMenuOnSelect={true}
                hideSelectedOptions={false}
                backspaceRemovesValue
                menuPortalTarget={isMounted ? document.body : null}
                menuPlacement="auto"
                formatGroupLabel={formatGroupLabel}
                noOptionsMessage={({ inputValue }) =>
                    isAllowAddNew && inputValue.trim() !== "" ? (
                        <AddToSelectBtn
                            onClick={() => handleOnCreate(inputValue)}
                            text={createNewSelectOption_btnText(inputValue)}
                        />
                    ) : (
                        <div>לא נמצאו אפשרויות</div>
                    )
                }
                onKeyDown={(e: React.KeyboardEvent) => {
                    if (
                        isAllowAddNew &&
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
                styles={stylesOverride}
                classNamePrefix="react-select"
            />
        </SelectLayout>
    );
};

export default InputGroupMultiSelect;
