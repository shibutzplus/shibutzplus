import React, { useEffect, useId, useState, useMemo } from "react";
import Select from "react-select";
import { GroupOption, SelectOption } from "@/models/types";
import AddToSelectBtn from "../../buttons/AddToSelectBtn/AddToSelectBtn";
import type { ActionMeta, OnChangeValue, StylesConfig } from "react-select";
import { SelectMethod } from "@/models/types/actions";
import { createNewSelectOption_btnText } from "@/utils/format";
import SelectLayout from "../SelectLayout/SelectLayout";
import { customStyles } from "@/style/selectStyle";
import { BorderRadiusInput, DarkTextColor, FontSize, InputBackgroundColor, } from "@/style/root";

export type InputMultiSelectProps = {
    label?: string;
    options: SelectOption[];
    error?: string;
    id?: string;
    value?: string[];
    onChange: (value: string[], method: SelectMethod) => void;
    placeholder?: string;
    isSearchable?: boolean;
    isAllowAddNew?: boolean;
    isDisabled?: boolean;
    hasBorder?: boolean;
    isClearable?: boolean;
    backgroundColor?: string;
    isBold?: boolean;
    onCreate?: (value: string) => Promise<string | undefined>;
    onBeforeRemove?: (removedLabel: string | null, proceed: () => void) => void;
};

const InputMultiSelect: React.FC<InputMultiSelectProps> = ({
    label,
    options: initialOptions,
    error,
    id,
    value = [],
    onChange,
    placeholder = "בחרו ערך...",
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
    const [createdOptions, setCreatedOptions] = useState<SelectOption[]>([]);
    const [isMounted, setIsMounted] = useState(false);
    const selectInstanceId = useId(); // for SSR consistency

    // Merge passed options with locally created ones
    const options = useMemo(() => {
        return [...initialOptions, ...createdOptions];
    }, [initialOptions, createdOptions]);

    // Derive selected options directly from props
    // We memoize this to prevent react-select from seeing a new object every time if nothing changed,
    // although react-select handles that well usually.
    const selectedOptions = useMemo(() => {
        if (!value || value.length === 0) return [];
        return value
            .map((v) => options.find((opt) => opt.value === v))
            .filter((x): x is SelectOption => Boolean(x));
    }, [value, options]);

    // Client-only portal target for menus to avoid SSR warning
    useEffect(() => {
        if (!isMounted) setIsMounted(true);
    }, [isMounted]);

    const handleChange = (
        opts: OnChangeValue<SelectOption, true>,
        meta: ActionMeta<SelectOption>,
    ) => {
        const next = Array.isArray(opts) ? [...opts] : [];

        // Intercept remove actions to allow confirmation
        if (onBeforeRemove && meta.action === "remove-value") {
            const removedLabel =
                ((meta as any).removedValue?.label as string | undefined) ?? null;

            return onBeforeRemove(removedLabel, () => {
                onChange(
                    next.map((o) => o.value),
                    meta.action as SelectMethod,
                );
            });
        }

        onChange(
            next.map((o) => o.value),
            meta.action as SelectMethod,
        );
    };

    const handleOnCreate = async (inputValue: string) => {
        const labelTrimmed = inputValue.trim();
        if (!labelTrimmed) return;

        // Prevent duplicates by label (case-insensitive)
        const exists = options.some(
            (option) => option.label.toLowerCase() === labelTrimmed.toLowerCase(),
        );

        if (!exists && isAllowAddNew && onCreate) {
            const valueId = await onCreate(labelTrimmed);
            if (valueId) {
                const newOption: SelectOption = { value: valueId, label: labelTrimmed };
                // Keep track of created options locally so they don't disappear
                // until the parent passes them back in 'initialOptions' (if ever)
                setCreatedOptions((prev) => [...prev, newOption]);

                const nextSelected = [...selectedOptions, newOption];
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
        valueContainer: (provided: any) => ({
            ...provided,
            flexWrap: "wrap",
        }),
        multiValue: (provided: any) => ({
            ...provided,
            backgroundColor: InputBackgroundColor,
            borderRadius: BorderRadiusInput,
            boxSizing: "border-box",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontWeight: isBold ? 600 : 500,
            margin: "0px 5px",
        }),
        multiValueLabel: (provided: any) => ({
            ...provided,
            color: DarkTextColor,
            fontSize: FontSize,
        }),
        multiValueRemove: (provided: any) => ({
            ...provided,
            "&:hover": {
                backgroundColor: "transparent",
                color: "red",
            },
        }),
        clearIndicator: (provided: any) => {
            const base =
                typeof baseStyles.clearIndicator === "function"
                    ? baseStyles.clearIndicator(provided)
                    : provided;
            return {
                ...base,
                color: DarkTextColor,
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
                instanceId={selectInstanceId}
                id={id}
                isMulti
                value={selectedOptions}
                onChange={handleChange}
                options={options}
                isSearchable={isSearchable}
                isClearable={isClearable}
                isDisabled={isDisabled}
                placeholder={placeholder}
                closeMenuOnSelect={true}
                hideSelectedOptions={false}
                backspaceRemovesValue
                noOptionsMessage={({ inputValue }) =>
                    isAllowAddNew ? (
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
                        e.key === "Enter" &&
                        typeof e.target === "object" &&
                        e.target &&
                        "value" in e.target
                    ) {
                        const inputValue = (e.target as HTMLInputElement).value;
                        const labelTrimmed = inputValue.trim();
                        if (!labelTrimmed) return;

                        // Check if any option matches the input (loose match)
                        const hasMatch = options.some((opt) =>
                            opt.label.toLowerCase().includes(labelTrimmed.toLowerCase()),
                        );

                        if (hasMatch) {
                            // Let react-select handle the selection of the highlighted option
                            return;
                        }

                        if (isAllowAddNew) {
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

export default React.memo(InputMultiSelect);
