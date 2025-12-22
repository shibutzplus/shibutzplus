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
import { InputBackgroundColor, TabColor } from "@/style/root";

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
    // Derived state instead of useState
    const selectedOption = useMemo(() => {
        if (value) {
            const allOptions = options.flatMap((group) => group.options);
            const found = allOptions.find((opt) => opt.value === value);
            return found || { value, label: value };
        }
        return null;
    }, [value, options]);

    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});
    const [inputValue, setInputValue] = useState("");

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
            // This is a naive check; if keys count differs, we should update.
            const prevKeys = Object.keys(prev);
            const nextKeys = Object.keys(next);
            if (!hasChanged && prevKeys.length === nextKeys.length) return prev;
            return next;
        });
    }, [options]);

    const handleOnCreate = async (inputValue: string) => {
        const allOptions = options.flatMap((group) => group.options);
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

    const selectRef = useRef<any>(null);
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
        const { Heading, ...safeHeadingProps } = props as any;

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

    return (
        <SelectLayout resolvedId={id || ""} error={error} label={label}>
            <Select<SelectOption, false, GroupOption>
                ref={(ref) => {
                    selectRef.current = ref;
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
                components={{ Group }}
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

                    const allOptions = options.flatMap((group) => group.options);
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
