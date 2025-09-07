import React, { useEffect, useId, useState } from "react";
import Select from "react-select";
import styles from "./InputMultiSelect.module.css";
import { SelectOption } from "@/models/types";
import AddToSelectBtn from "../../buttons/AddToSelectBtn/AddToSelectBtn";
import type { ActionMeta, OnChangeValue } from "react-select";
import { customStylesMulti } from "@/style/selectMultiStyle";
import { SelectMethod } from "@/models/types/actions";
import { createNewSelectOption_btnText } from "@/utils/format";

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
    backgroundColor?: "white" | "transparent";
    isClearable?: boolean;
    onCreate?: (value: string) => Promise<string | undefined>;
    createBtnText?: string;
    closeMenuOnSelect?: boolean;
    onBeforeRemove?: (removedLabel: string | null, proceed: () => void) => void;
};

const InputMultiSelect: React.FC<InputMultiSelectProps> = ({
    label,
    options: initialOptions,
    error,
    id,
    value = [],
    onChange,
    placeholder = "בחר אופציה...",
    isSearchable = true,
    isAllowAddNew = false,
    isDisabled = false,
    hasBorder = false,
    backgroundColor = "white",
    isClearable = false,
    onCreate,
    createBtnText,
    closeMenuOnSelect = true,
    onBeforeRemove,
}) => {
    const [options, setOptions] = useState<SelectOption[]>(initialOptions);
    const [selectedOptions, setSelectedOptions] = useState<SelectOption[]>([]);
    const [isMounted, setIsMounted] = useState(false);

    // Unique id for SSR consistency
    const selectInstanceId = useId();

    // Sync options list when parent updates
    useEffect(() => {
        setOptions(initialOptions);
    }, [initialOptions]);

    // Sync selected options from incoming values
    useEffect(() => {
        if (!value || value.length === 0) {
            setSelectedOptions([]);
            return;
        }
        const selected = value
            .map((v) => options.find((opt) => opt.value === v))
            .filter((x): x is SelectOption => Boolean(x));
        setSelectedOptions(selected);
    }, [value, options]);

    // Client-only portal target for menus to avoid SSR warning
    useEffect(() => {
        setIsMounted(true);
    }, []);

    const applyChange = (
        next: SelectOption[],
        meta: ActionMeta<SelectOption>
    ) => {
        setSelectedOptions(next);
        onChange(next.map((o) => o.value), meta.action as SelectMethod);
    };

    const handleChange = (
        opts: OnChangeValue<SelectOption, true>,
        meta: ActionMeta<SelectOption>
    ) => {
        const next = Array.isArray(opts) ? [...opts] : [];

        // Intercept remove actions to allow confirmation
        if (onBeforeRemove && meta.action === "remove-value") {
            const removedLabel =
                ((meta as any).removedValue?.label as string | undefined) ?? null;

            return onBeforeRemove(removedLabel, () => applyChange(next, meta));
        }

        applyChange(next, meta);
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
                const updatedOptions = [...options, newOption];
                setOptions(updatedOptions);
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
                closeMenuOnSelect={closeMenuOnSelect}
                hideSelectedOptions={false}
                backspaceRemovesValue
                menuPortalTarget={isMounted ? document.body : null}
                menuPlacement="auto"
                noOptionsMessage={({ inputValue }) =>
                    isAllowAddNew ? (
                        <AddToSelectBtn
                            onClick={() => handleOnCreate(inputValue)}
                            text={createNewSelectOption_btnText(inputValue, createBtnText)}
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
                        const exists = options.some(
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
                    "white",
                    "#aaa",
                    600)}
                classNamePrefix="react-select"
            />

            {error && <p className={styles.errorText}>{error}</p>}
        </div>
    );
};

export default InputMultiSelect;
