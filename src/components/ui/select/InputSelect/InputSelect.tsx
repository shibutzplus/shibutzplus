"use client";
import React, { useEffect, useState, useMemo, useRef } from "react";
import CreatableSelect from "react-select/creatable";
import Select, {
    ActionMeta,
    OnChangeValue,
    StylesConfig,
    components,
    SingleValueProps,
} from "react-select";
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
    isCentered?: boolean;
    fontSize?: string;
    caretColor?: string;
    isCreatable?: boolean;
    formatCreateLabel?: (inputValue: string) => string;
    menuPortalTarget?: HTMLElement | null;
    menuWidth?: string;
    menuAlign?: "left" | "right";
    isCompact?: boolean;
    autoFocus?: boolean;
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
    isCentered = false,
    fontSize,
    caretColor,
    isCreatable = false,
    formatCreateLabel,
    menuPortalTarget = (typeof document !== "undefined" ? document.body : null),
    menuWidth,
    menuAlign = "right",
    isCompact = false,
    autoFocus = false,
}) => {
    const selectRef = useRef<any>(null);
    const [selectedOption, setSelectedOption] = useState<SelectOption | null>(null);
    const [isMounted, setIsMounted] = useState(false);
    // Sync selected option from incoming value
    useEffect(() => {
        if (!value) {
            setSelectedOption(null);
            return;
        }
        // Try to find existing option
        const selected =
            options.find((o) => o.value === value) ??
            (isCreatable ? { label: value, value: value } : null);
        setSelectedOption(selected);
    }, [value, options, isCreatable]);
    // Client-only portal target for menus to avoid SSR warning
    useEffect(() => {
        if (!isMounted) setIsMounted(true);
    }, [isMounted]);
    // Auto focus support
    useEffect(() => {
        if (autoFocus) {
            selectRef.current?.focus();
        }
    }, [autoFocus]);
    const handleChange = (
        opt: OnChangeValue<SelectOption, false>,
        meta: ActionMeta<SelectOption>,
    ) => {
        const nextOption = opt ?? null;
        const next = nextOption?.value ?? "";
        setSelectedOption(nextOption);
        onChange(next, meta.action as SelectMethod);
    };
    const stylesOverride: StylesConfig<SelectOption, false> = useMemo(() => {
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
                    ...(isCompact ? { padding: "2px 2px 2px 0px" } : {}),
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
                    fontWeight: isBold ? 700 : 400,
                    textAlign: isCentered ? "center" : "right",
                    width: isCentered ? "100%" : "auto",
                    gridArea: "1/1/2/3",
                    minWidth: 0, // Allow truncation in grid
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: isCentered ? "center" : "flex-start",
                    padding: isCompact ? "0 2px" : "0 5px",
                };
            },
            dropdownIndicator: (provided: any) => {
                const base =
                    typeof baseStyles.dropdownIndicator === "function"
                        ? baseStyles.dropdownIndicator(provided)
                        : provided;
                return {
                    ...base,
                    padding: isCompact ? "0 2px 0 4px" : "0 4px 0 6px",
                };
            },
            indicatorsContainer: (provided: any) => ({
                ...provided,
                padding: 0,
            }),
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
                    textAlign: isCentered ? "center" : "right",
                    pointerEvents: "none",
                    userSelect: "none",
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
                    textAlign: isCentered ? "center" : "right",
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
            menu: (provided: any) => ({
                ...provided,
                width: menuWidth || provided.width,
                left: menuAlign === "left" ? 0 : "auto",
                right: menuAlign === "right" ? 0 : "auto",
            }),
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
        menuWidth,
        menuAlign,
        isCompact,
    ]);
    const CustomSingleValue = (props: SingleValueProps<SelectOption>) => {
        const [isHovered, setIsHovered] = useState(false);
        return (
            <components.SingleValue {...props}>
                <div
                    style={{
                        flex: "0 1 auto",
                        overflow: "hidden",
                        textOverflow: "clip",
                        whiteSpace: "nowrap",
                        textAlign: isCentered ? "center" : "right",
                    }}
                >
                    {props.children}
                </div>
                {isClearable && selectedOption && (
                    <div
                        className="custom-select-clear-btn"
                        onMouseDown={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            handleChange(null, { action: "clear" } as any);
                            setTimeout(() => {
                                selectRef.current?.focus();
                            }, 0);
                        }}
                        onTouchEnd={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            handleChange(null, { action: "clear" } as any);
                            setTimeout(() => {
                                selectRef.current?.focus();
                            }, 0);
                        }}
                        onMouseEnter={() => setIsHovered(true)}
                        onMouseLeave={() => setIsHovered(false)}
                        style={{
                            marginRight: "2px",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            color: isHovered ? "red" : InputColor,
                            padding: "0 2px",
                            zIndex: 5,
                            position: "relative",
                            pointerEvents: "auto",
                            flexShrink: 0,
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

    const focusInputEl = (el: HTMLElement | null) => {
        if (!el) return;
        const input = el.querySelector("input");
        if (input) {
            input.focus();
            requestAnimationFrame(() => {
                if (document.activeElement !== input) {
                    input.focus();
                }
            });
        }
    };

    const CustomControl = (props: any) => {
        return (
            <components.Control
                {...props}
                innerProps={{
                    ...props.innerProps,
                    onMouseDown: (e: React.MouseEvent<HTMLDivElement>) => {
                        props.innerProps?.onMouseDown?.(e);
                        const target = e.target as HTMLElement;
                        if (target && target.tagName !== "INPUT" && target.tagName !== "TEXTAREA") {
                            focusInputEl(e.currentTarget);
                        }
                    },
                    onClick: (e: React.MouseEvent<HTMLDivElement>) => {
                        props.innerProps?.onClick?.(e);
                        const target = e.target as HTMLElement;
                        if (target && target.tagName !== "INPUT" && target.tagName !== "TEXTAREA") {
                            focusInputEl(e.currentTarget);
                        }
                    },
                }}
            />
        );
    };

    const CustomInput = (props: any) => {
        const isHidden = props.selectProps?.menuIsOpen ? false : props.isHidden;
        return <components.Input {...props} isHidden={isHidden} />;
    };

    const defaultFormatOptionLabel = (
        option: SelectOption,
        { context }: { context: "menu" | "value" }
    ) => {
        if (context === "menu") {
            if (option.subLabel) {
                return (
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: "8px",
                            width: "100%",
                        }}
                    >
                        <span
                            style={{
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                                fontWeight: 400,
                            }}
                        >
                            {option.label}
                        </span>
                        <span
                            style={{
                                fontSize: "11px",
                                padding: "1px 7px",
                                borderRadius: "9999px",
                                backgroundColor: "rgba(0, 0, 0, 0.01)",
                                color: "rgba(0, 0, 0, 0.45)",
                                border: "1px solid rgba(0, 0, 0, 0.07)",
                                whiteSpace: "nowrap",
                                fontWeight: 500,
                                lineHeight: 1.3,
                                flexShrink: 0,
                            }}
                        >
                            {option.subLabel}
                        </span>
                    </div>
                );
            }
        }
        return option.label;
    };

    const defaultFilterOption = (
        candidate: { label: string; value: string; data: SelectOption },
        input: string
    ) => {
        if (!input) return true;
        const search = input.trim().toLowerCase();
        const labelMatch = candidate.label?.toLowerCase().includes(search);
        const subLabelMatch = candidate.data?.subLabel?.toLowerCase().includes(search);
        return Boolean(labelMatch || subLabelMatch);
    };

    const SelectComponent = isCreatable ? CreatableSelect : Select;
    return (
        <SelectLayout resolvedId={id || ""} error={error} label={label}>
            <SelectComponent
                ref={selectRef}
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
                menuPortalTarget={isMounted ? menuPortalTarget : null}
                menuPlacement="auto"
                menuPosition="fixed"
                noOptionsMessage={() => <div>לא נמצאו אפשרויות</div>}
                formatCreateLabel={formatCreateLabel}
                formatOptionLabel={defaultFormatOptionLabel}
                filterOption={defaultFilterOption}
                styles={stylesOverride}
                classNamePrefix="react-select"
                isRtl={true}
                autoFocus={autoFocus}
                components={{
                    Control: CustomControl,
                    Input: CustomInput,
                    SingleValue: CustomSingleValue,
                    ClearIndicator: () => null,
                }}
            />
        </SelectLayout>
    );
};
export default InputSelect;
