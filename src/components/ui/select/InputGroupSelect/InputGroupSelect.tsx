"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import Select, { StylesConfig, components } from "react-select";
import { GroupOption, SelectOption } from "@/models/types";
import { customStyles } from "@/style/selectStyle";
import { createNewSelectOption_btnText } from "@/utils/format";
import { useMobileSelectScroll } from "@/hooks/scroll/useMobileSelectScroll";
import AddToSelectBtn from "../../buttons/AddToSelectBtn/AddToSelectBtn";
import styles from "./InputGroupSelect.module.css";
import SelectLayout from "../SelectLayout/SelectLayout";
import { InputBackgroundColor, TabColor, InputColor } from "@/style/root";

/**
 * DailyTeacherCell - Sub Teacher
 */
export interface InputGroupSelectProps {
    label?: string;
    options: GroupOption[];
    error?: string;
    id?: string;
    value?: string;
    onChange: (value: string) => void;
    placeholder?: string;
    isSearchable?: boolean;
    isAllowAddNew?: boolean;
    isDisabled?: boolean;
    hasBorder?: boolean;
    backgroundColor?: string;
    isClearable?: boolean;
    onCreate?: (value: string) => Promise<void>;
    menuWidth?: string;
    color?: string;
}

const InputGroupSelect: React.FC<InputGroupSelectProps> = ({
    label,
    options,
    error,
    id,
    value,
    onChange,
    placeholder = "בחרו ערך...",
    isSearchable = true,
    isAllowAddNew = false,
    isDisabled = false,
    hasBorder = false,
    backgroundColor = InputBackgroundColor,
    isClearable = false,
    onCreate,
    menuWidth,
    color,
}) => {
    const [inputValue, setInputValue] = useState("");
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});

    const allOptions = useMemo(() => options.flatMap((group) => group.options), [options]);

    // Derived state instead of useState
    const selectedOption = useMemo(() => {
        if (value) {
            const found = allOptions.find((opt) => opt.value === value);
            return found || { value, label: value };
        }
        return null;
    }, [value, allOptions]);

    // Initialize collapsed state per group based on GroupOption.collapsed
    useEffect(() => {
        setCollapsedGroups((prev) => {
            const next: Record<string, boolean> = {};
            let hasChanged = false;
            options.forEach((g) => {
                const newVal = prev[g.label] !== undefined ? prev[g.label] : ((g as any).collapsed ?? false);
                next[g.label] = newVal;
                if (prev[g.label] !== newVal) hasChanged = true;
            });
            // Simple optimization to avoid update if keys/values are identical
            const prevKeys = Object.keys(prev);
            const nextKeys = Object.keys(next);
            if (!hasChanged && prevKeys.length === nextKeys.length) return prev;
            return next;
        });
    }, [options]);

    const handleOnCreate = async (inputValue: string) => {
        const existsExact = allOptions.some(
            (opt) => opt.label.trim().toLowerCase() === inputValue.trim().toLowerCase(),
        );
        if (!existsExact && isAllowAddNew && onCreate) {
            await onCreate(inputValue);
            // Parent handles update via props, no local set needed
            onChange(inputValue);
        }
    };

    const handleChange = (option: SelectOption | null) => {
        onChange(option ? option.value : "");
    };

    // removed unused selectRef
    const { selectRef: mobileScrollRef, handleMenuOpen } = useMobileSelectScroll();

    const baseStyles = customStyles(error || "", hasBorder, true, backgroundColor, color);
    const stylesOverride: StylesConfig<SelectOption, false, GroupOption> = {
        ...(baseStyles as StylesConfig<SelectOption, false, GroupOption>),
        control: (prov: any, state: any) => {
            const b =
                typeof (baseStyles as any).control === "function"
                    ? (baseStyles as any).control(prov, state)
                    : prov;
            return {
                ...b,
                border: "none",
                backgroundColor: InputBackgroundColor,
                minHeight: 32,
            };
        },
        menu: (prov: any) => {
            const b =
                typeof (baseStyles as any).menu === "function" ? (baseStyles as any).menu(prov) : prov;
            return {
                ...b,
                width: menuWidth || b.width,
                minWidth: menuWidth ? "auto" : b.minWidth,
            };
        },
        option: (prov: any) => ({
            ...prov,
            padding: "8px 18px 8px 8px",
            fontSize: "16px",
        }),
        groupHeading: (prov: any) => ({
            ...prov,
            paddingTop: "8px",
            paddingBottom: "8px",
            paddingRight: "5px",
            fontSize: "15px",
            backgroundColor: TabColor,
        }),
        singleValue: (prov: any) => ({
            ...prov,
            fontWeight: "bold",
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
        }),
    };

    // Custom Group: always render heading, hide children (options) when collapsed
    const Group = (props: any) => {
        const { data } = props;
        const isCollapsed =
            inputValue.trim().length > 0 ? false : (collapsedGroups[data.label] ?? false);

        const toggle = () => {
            setCollapsedGroups((prev) => ({
                ...prev,
                [data.label]: !isCollapsed,
            }));
        };

        // remove props that leak to DOM via GroupHeading
        const { Heading, headingProps, ...safeHeadingProps } = props as any;

        const optionsChildren = props.children;

        return (
            <div>
                <components.GroupHeading {...safeHeadingProps}>
                    <div className={styles.groupStyles} onClick={toggle}>
                        <span>{data.label}</span>
                        {!data.hideCount && (
                            <span className={styles.groupBadgeStyles}>{data.options.length}</span>
                        )}
                    </div>
                </components.GroupHeading>
                {!isCollapsed && optionsChildren}
            </div>
        );
    };

    const CustomSingleValue = (props: any) => {
        const [isHovered, setIsHovered] = useState(false);
        return (
            <components.SingleValue {...props}>
                {props.children}
                {isClearable && selectedOption && (
                    <div
                        onMouseDown={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            handleChange(null);
                        }}
                        onTouchEnd={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            handleChange(null);
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
            <Select<SelectOption, false, GroupOption>
                ref={(ref) => {
                    mobileScrollRef.current = ref;
                }}
                inputId={id}
                value={selectedOption}
                onChange={handleChange}
                options={options}
                isSearchable={isSearchable}
                isClearable={isClearable}
                isDisabled={isDisabled}
                placeholder={placeholder}
                menuPlacement="auto"
                // menuPortalTarget={typeof document !== "undefined" ? document.body : null}
                onMenuOpen={() => {
                    handleMenuOpen();
                    setIsMenuOpen(true);
                }}
                onMenuClose={() => setIsMenuOpen(false)}
                onInputChange={(val) => setInputValue(val)}
                components={{
                    Group,
                    SingleValue: CustomSingleValue,
                    ClearIndicator: () => null,
                }}
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
                    if (e.key !== "Enter" || !(typeof e.target === "object" && "value" in e.target))
                        return;

                    const inputValue = (e.target as HTMLInputElement).value.trim();
                    if (!inputValue) return;

                    const hasExact = allOptions.some(
                        (opt) => opt.label.trim().toLowerCase() === inputValue.toLowerCase(),
                    );
                    const hasAnyMatch = allOptions.some((opt) =>
                        opt.label.toLowerCase().includes(inputValue.toLowerCase()),
                    );

                    if (isMenuOpen) {
                        if (!hasAnyMatch && isAllowAddNew && !hasExact) {
                            e.preventDefault();
                            handleOnCreate(inputValue);
                        }
                        return;
                    }

                    if (!hasExact && isAllowAddNew) {
                        e.preventDefault();
                        handleOnCreate(inputValue);
                    }
                }}
                styles={stylesOverride}
                classNamePrefix="react-select"
            />
        </SelectLayout>
    );
};

export default React.memo(InputGroupSelect);
