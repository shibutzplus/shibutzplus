"use client";

import React, { useEffect, useState } from "react";
import Select, { ActionMeta, OnChangeValue, StylesConfig } from "react-select";
import { SelectOption } from "@/models/types";
import { customStyles } from "@/style/selectStyle";
import SelectLayout from "../SelectLayout/SelectLayout";
import { InputBackgroundColor, InputColor, InputColorHover, PlaceholderColor } from "@/style/root";
import { SelectMethod } from "@/models/types/actions";

/**
 * Sign-Up
 * Teachers Sign-In
 * Annual By Teacher 
 * Daily Schedule Header
 */
type InputSelectProps = {
    label?: string;
    options: SelectOption[];
    error?: string;
    id?: string;
    value?: string;
    onChange: (value: string, method?: SelectMethod) => void;
    placeholder?: string;
    isSearchable?: boolean;
    isDisabled?: boolean;
    hasBorder?: boolean;
    isClearable?: boolean;
    backgroundColor?: string;
    color?: string;
    placeholderColor?: string;
    colorHover?: string;
    isBold?: boolean;
    onBeforeRemove?: (removedLabel: string | null, proceed: () => void) => void;
    isCentered?: boolean;
};

const InputSelect: React.FC<InputSelectProps> = ({
    label,
    options,
    error,
    id,
    value,
    onChange,
    placeholder = "בחר אופציה...",
    isSearchable = true,
    isDisabled = false,
    hasBorder = false,
    isClearable = false,
    backgroundColor = InputBackgroundColor,
    color = InputColor,
    placeholderColor = PlaceholderColor,
    colorHover = InputColorHover,
    isBold = false,
    onBeforeRemove,
    isCentered = false,
}) => {
    const [selectedOption, setSelectedOption] = useState<SelectOption | null>(null);
    const [isMounted, setIsMounted] = useState(false);

    // Sync selected option from incoming value
    useEffect(() => {
        if (!value) {
            setSelectedOption(null);
            return;
        }
        const selected = options.find((o) => o.value === value) ?? null;
        setSelectedOption(selected);
    }, [value, options]);

    // Client-only portal target for menus to avoid SSR warning
    useEffect(() => {
        if (!isMounted) setIsMounted(true);
    }, [isMounted]);

    const handleChange = (
        opt: OnChangeValue<SelectOption, false>,
        meta: ActionMeta<SelectOption>,
    ) => {
        const nextOption = opt ?? null;
        const next = nextOption?.value ?? "";

        // Intercept clear/remove actions to allow confirmation
        if (onBeforeRemove && (meta.action === "clear" || meta.action === "remove-value")) {
            const removedLabel = selectedOption?.label ?? null;

            return onBeforeRemove(removedLabel, () => {
                setSelectedOption(nextOption);
                onChange(next, meta.action as SelectMethod);
            });
        }

        setSelectedOption(nextOption);
        onChange(next, meta.action as SelectMethod);
    };

    const baseStyles = customStyles(
        error || "",
        hasBorder,
        isDisabled ? false : true,
        backgroundColor,
        color,
        placeholderColor,
        colorHover,
    );
    const stylesOverride: StylesConfig<SelectOption, false> = {
        ...(baseStyles as StylesConfig<SelectOption, false>),
        control: (provided: any) => {
            const base =
                typeof baseStyles.control === "function"
                    ? baseStyles.control(provided)
                    : provided;
            return {
                ...base,
                flexWrap: "nowrap", // Prevent wrapping of indicators
            };
        },
        valueContainer: (provided: any) => {
            const base =
                typeof baseStyles.valueContainer === "function"
                    ? baseStyles.valueContainer(provided)
                    : provided;
            return {
                ...base,
                overflow: "hidden",
                justifyContent: isCentered ? "center" : "flex-start",
                flex: "1 1 auto",
                flexWrap: "nowrap",
                display: "grid",
                gridTemplateColumns: "1fr auto",
                minWidth: 0, // Allow shrinking below content size
            };
        },
        indicatorsContainer: (provided: any) => ({
            ...provided,
            flexShrink: 0,
            display: "flex",
            justifyContent: "flex-start",
        }),
        dropdownIndicator: (provided: any) => ({
            ...provided,
            marginRight: "auto",
            padding: 10,
        }),
        singleValue: (provided: any) => {
            const base =
                typeof baseStyles.singleValue === "function"
                    ? baseStyles.singleValue(provided)
                    : provided;
            return {
                ...base,
                maxWidth: "100%",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                fontWeight: isBold ? 600 : 500,
                textAlign: isCentered ? "center" : "right",
                width: isCentered ? "100%" : "auto",
                gridArea: "1/1/2/3",
                minWidth: 0, // Allow truncation in grid
            };
        },
        input: (provided: any) => ({
            ...provided,
            gridArea: "1/1/2/3",
            visibility: "visible",
            minWidth: 0,
        }),
        clearIndicator: (provided: any) => {
            const base =
                typeof baseStyles.clearIndicator === "function"
                    ? baseStyles.clearIndicator(provided)
                    : provided;
            return {
                ...base,
                color: InputColor,
                cursor: "pointer",
                borderRadius: "50%",
                width: 30,
                height: 30,
                marginLeft: -5,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                "&:hover": {
                    color: "red",
                },
            };
        },

    };

    return (
        <SelectLayout resolvedId={id || ""} error={error} label={label}>
            <Select
                inputId={id}
                value={selectedOption}
                onChange={handleChange}
                options={options}
                isSearchable={isSearchable}
                isClearable={isClearable}
                isDisabled={isDisabled}
                placeholder={placeholder}
                closeMenuOnSelect={true}
                hideSelectedOptions={false}
                backspaceRemovesValue
                menuPortalTarget={isMounted ? document.body : null}
                menuPlacement="auto"
                noOptionsMessage={() => <div>לא נמצאו אפשרויות</div>}
                styles={stylesOverride}
                classNamePrefix="react-select"
            />
        </SelectLayout>
    );
};

export default InputSelect;
