"use client";

import React, { useEffect, useState } from "react";
import Select, { ActionMeta, OnChangeValue, StylesConfig, components, SingleValueProps } from "react-select";
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
    fontSize?: string;
    caretColor?: string;
};

const InputSelect: React.FC<InputSelectProps> = ({
    label,
    options,
    error,
    id,
    value,
    onChange,
    placeholder = "בחרו ערך...",
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
    fontSize,
    caretColor,
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

    const stylesOverride: StylesConfig<SelectOption, false> = React.useMemo(() => {
        const baseStyles = customStyles(
            error || "",
            hasBorder,
            isDisabled ? false : true,
            backgroundColor,
            color,
            placeholderColor,
            colorHover,
        );

        return {
            ...(baseStyles as StylesConfig<SelectOption, false>),
            control: (provided: any) => {
                const base =
                    typeof baseStyles.control === "function"
                        ? baseStyles.control(provided)
                        : provided;
                return {
                    ...base,
                    fontSize: fontSize || base.fontSize,
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

            singleValue: (provided: any) => {
                const base =
                    typeof baseStyles.singleValue === "function"
                        ? baseStyles.singleValue(provided)
                        : provided;
                return {
                    ...base,
                    fontSize: fontSize || base.fontSize,
                    maxWidth: "100%",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    fontWeight: isBold ? 600 : 400,
                    textAlign: isCentered ? "center" : "right",
                    width: isCentered ? "100%" : "auto",
                    gridArea: "1/1/2/3",
                    minWidth: 0, // Allow truncation in grid
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: isCentered ? "center" : "flex-start",
                    padding: "0 5px",
                };
            },
            input: (provided: any) => ({
                ...provided,
                fontSize: fontSize || provided.fontSize,
                gridArea: "1/1/2/3",
                visibility: "visible",
                minWidth: 0,
                caretColor: caretColor || color,
                color: color,
            }),
            placeholder: (provided: any) => {
                const base =
                    typeof baseStyles.placeholder === "function"
                        ? baseStyles.placeholder(provided)
                        : provided;
                return {
                    ...base,
                    fontSize: fontSize || base.fontSize,
                };
            },
            option: (provided: any, state: any) => {
                const base =
                    typeof baseStyles.option === "function"
                        ? baseStyles.option(provided, state)
                        : provided;
                return {
                    ...base,
                    fontSize: fontSize || base.fontSize,
                };
            },
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
    }, [
        error,
        hasBorder,
        isDisabled,
        backgroundColor,
        color,
        placeholderColor,
        colorHover,
        fontSize,
        isBold,
        isCentered,
        caretColor,
    ]);

    const CustomSingleValue = (props: SingleValueProps<SelectOption>) => {
        const [isHovered, setIsHovered] = useState(false);
        return (
            <components.SingleValue {...props}>
                {props.children}
                {isClearable && selectedOption && (
                    <div
                        onMouseDown={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            handleChange(null, { action: "clear" } as any);
                        }}
                        onTouchEnd={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            handleChange(null, { action: "clear" } as any);
                        }}
                        onMouseEnter={() => setIsHovered(true)}
                        onMouseLeave={() => setIsHovered(false)}
                        style={{
                            marginRight: "9px",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            color: isHovered ? "red" : InputColor,
                            padding: "0 6px",
                            zIndex: 5,
                            position: "relative",
                            pointerEvents: "auto",
                        }}
                    >
                        <svg
                            height="14"
                            width="14"
                            viewBox="0 0 20 20"
                            aria-hidden="true"
                            focusable="false"
                            style={{ fill: "currentColor" }}
                        >
                            <path d="M14.348 14.849c-0.469 0.469-1.229 0.469-1.697 0l-2.651-3.030-2.651 3.029c-0.469 0.469-1.229 0.469-1.697 0-0.469-0.469-0.469-1.229 0-1.697l2.758-3.15-2.759-3.152c-0.469-0.469-0.469-1.228 0-1.697s1.228-0.469 1.697 0l2.652 3.031 2.651-3.031c0.469-0.469 1.228-0.469 1.697 0s0.469 1.229 0 1.697l-2.758 3.152 2.758 3.15c0.469 0.469 0.469 1.229 0 1.698z"></path>
                        </svg>
                    </div>
                )}
            </components.SingleValue>
        );
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
                menuPosition="fixed"
                noOptionsMessage={() => <div>לא נמצאו אפשרויות</div>}
                styles={stylesOverride}
                classNamePrefix="react-select"
                components={{
                    SingleValue: CustomSingleValue,
                    ClearIndicator: () => null,
                }}
            />
        </SelectLayout>
    );
};

export default InputSelect;
