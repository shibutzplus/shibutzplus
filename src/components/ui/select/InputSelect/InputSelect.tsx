"use client";

import React, { useMemo } from "react";
import Select, { StylesConfig } from "react-select";
import { SelectOption } from "@/models/types";
import { customStyles } from "@/style/selectStyle";
import SelectLayout from "../SelectLayout/SelectLayout";
import { InputBackgroundColor, InputColor, InputColorHover } from "@/style/root";

/**
 * Sign-Up
 * Teachers Sign-In
 * TopActions (Annual, Daily, Teacher Portal)
 * Annual Schedule Cell
 * Daily Schedule Header
 */
type InputSelectProps = {
    label?: string;
    options: SelectOption[];
    error?: string;
    id?: string;
    value?: string;
    onChange: (value: string) => void;
    placeholder?: string;
    isSearchable?: boolean;
    isDisabled?: boolean;
    hasBorder?: boolean;
    backgroundColor?: string;
    color?: string;
    colorHover?: string;
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
    backgroundColor = InputBackgroundColor,
    color = InputColor,
    colorHover = InputColorHover,
}) => {
    // derive selected option directly from props
    const selectedOption = useMemo(
        () => (value ? (options.find((o) => o.value === value) ?? null) : null),
        [value, options],
    );

    const handleChange = (opt: SelectOption | null) => {
        const next = opt?.value ?? "";
        if ((value ?? "") !== next) onChange(next);
    };

    const baseStyles = customStyles(
        error || "",
        hasBorder,
        isDisabled ? false : true,
        backgroundColor,
        color,
        colorHover,
    );
    const stylesOverride: StylesConfig<SelectOption, false> = {
        ...(baseStyles as StylesConfig<SelectOption, false>),
        valueContainer: (provided: any) => {
            const base =
                typeof baseStyles.valueContainer === "function"
                    ? baseStyles.valueContainer(provided)
                    : provided;
            return {
                ...base,
                overflow: "visible",
            };
        },
        singleValue: (provided: any) => {
            const base =
                typeof baseStyles.singleValue === "function"
                    ? baseStyles.singleValue(provided)
                    : provided;
            return {
                ...base,
                maxWidth: "none",
                overflow: "visible",
                whiteSpace: "nowrap",
            };
        },
        clearIndicator: (provided: any) => {
            const base =
                typeof baseStyles.clearIndicator === "function"
                    ? baseStyles.clearIndicator(provided)
                    : provided;
            return {
                ...base,
                marginLeft: -10,
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
                isClearable={false}
                isDisabled={isDisabled}
                placeholder={placeholder}
                menuPlacement="auto"
                noOptionsMessage={() => <div>לא נמצאו אפשרויות</div>}
                styles={stylesOverride}
                classNamePrefix="react-select"
            />
        </SelectLayout>
    );
};

export default InputSelect;
