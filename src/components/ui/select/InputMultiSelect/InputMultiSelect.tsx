import React, { useEffect, useId, useState } from "react";
import Select from "react-select";
import styles from "./InputMultiSelect.module.css";
import { SelectOption } from "@/models/types";
import { customStyles } from "@/style/selectStyle";
import AddToSelectBtn from "../../buttons/AddToSelectBtn/AddToSelectBtn";
import type { ActionMeta, OnChangeValue } from "react-select";
import { customStylesMulti } from "@/style/selectMultiStyle";
import { SubjectSelectOptionColor } from "@/style/tableColors";

export type InputMultiSelectProps = {
    label?: string;
    options: SelectOption[];
    error?: string;
    id?: string;
    /** Selected values */
    value?: string[];
    onChange: (value: string[]) => void;
    placeholder?: string;
    isSearchable?: boolean;
    allowAddNew?: boolean;
    isDisabled?: boolean;
    hasBorder?: boolean;
    backgroundColor?: "white" | "transparent";
    /** Clears all selections when true */
    isClearable?: boolean;
    /** Create handler should return the new option id (value) */
    onCreate?: (value: string) => Promise<string | undefined>;
    /** Keep menu open when selecting multiple (recommended for multi) */
    closeMenuOnSelect?: boolean;
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
    allowAddNew = false,
    isDisabled = false,
    hasBorder = false,
    backgroundColor = "white",
    isClearable = false,
    onCreate,
    closeMenuOnSelect = true,
}) => {
    const [options, setOptions] = useState<SelectOption[]>(initialOptions);
    const [selectedOptions, setSelectedOptions] = useState<SelectOption[]>([]);
    const [isMounted, setIsMounted] = useState(false);

    // Generate a unique instanceId for SSR consistency
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

    const handleChange = (
        opts: OnChangeValue<SelectOption, true>,
        meta: ActionMeta<SelectOption>,
    ) => {
        const next = Array.isArray(opts) ? [...opts] : [];
        setSelectedOptions(next);
        onChange(next.map((o) => o.value));
    };

    const handleOnCreate = async (inputValue: string) => {
        const labelTrimmed = inputValue.trim();
        if (!labelTrimmed) return;

        // Prevent duplicates by label (case-insensitive)
        const exists = options.some(
            (option) => option.label.toLowerCase() === labelTrimmed.toLowerCase(),
        );

        if (!exists && allowAddNew && onCreate) {
            const valueId = await onCreate(labelTrimmed);
            if (valueId) {
                const newOption: SelectOption = { value: valueId, label: labelTrimmed };
                const updatedOptions = [...options, newOption];
                setOptions(updatedOptions);
                // Add to selection set
                const nextSelected = [...selectedOptions, newOption];
                setSelectedOptions(nextSelected);
                onChange(nextSelected.map((o) => o.value));
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
                    allowAddNew ? (
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
                    SubjectSelectOptionColor,
                )}
                classNamePrefix="react-select"
            />

            {error && <p className={styles.errorText}>{error}</p>}
        </div>
    );
};

export default InputMultiSelect;
