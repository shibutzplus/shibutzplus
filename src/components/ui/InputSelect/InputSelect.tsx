"use client";

import React, { useState, useEffect, useId } from "react";
import Select from "react-select";
import styles from "./InputSelect.module.css";
import { SelectOption } from "@/models/types";
import { customStyles } from "@/style/selectStyle";

type InputSelectProps = {
    label?: string;
    options: SelectOption[];
    error?: string;
    id?: string;
    value?: string;
    onChange: (value: string) => void;
    placeholder?: string;
    isSearchable?: boolean;
    allowAddNew?: boolean;
    isDisabled?: boolean;
    hasBorder?: boolean;
    backgroundColor?: "white" | "transparent";
    isClearable?: boolean;
    onCreate?: (value: string) => Promise<string | undefined>;
}

const InputSelect: React.FC<InputSelectProps> = ({
    label,
    options: initialOptions,
    error,
    id,
    value,
    onChange,
    placeholder = "בחר אופציה...",
    isSearchable = true,
    allowAddNew = false,
    isDisabled = false,
    hasBorder = false,
    backgroundColor = "white",
    isClearable = false,
    onCreate,
}) => {
    const [options, setOptions] = useState<SelectOption[]>(initialOptions);
    const [selectedOption, setSelectedOption] = useState<SelectOption | null>(null);
    const [isMounted, setIsMounted] = useState(false);

    // Generate a unique instanceId for SSR consistency
    const selectInstanceId = useId();

    useEffect(() => {
        if (value) {
            const option = options.find((opt) => opt.value === value);
            setSelectedOption(option || null);
        } else {
            setSelectedOption(null);
        }
    }, [value, options]);

    useEffect(() => {
        setOptions(initialOptions);
    }, [initialOptions]);

    const handleOnCreate = async (inputValue: string) => {
        // Check if the option already exists
        const exists = options.some(
            (option) => option.label.toLowerCase() === inputValue.toLowerCase(),
        );

        if (!exists && allowAddNew && onCreate) {
            const valueId = await onCreate(inputValue);
            if (valueId) {
                const newOption: SelectOption = {
                    value: valueId,
                    label: inputValue,
                };
                const updatedOptions = [...options, newOption];
                setOptions(updatedOptions);
                setSelectedOption(newOption);
            }
        }
    };

    const handleChange = (option: SelectOption | null) => {
        setSelectedOption(option);
        onChange(option ? option.value : "");
    };

    useEffect(() => {
        // Set mounted state to true after component mounts on client
        setIsMounted(true);
    }, []);

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
                value={selectedOption}
                onChange={handleChange}
                options={options}
                isSearchable={isSearchable}
                isClearable={isClearable}
                isDisabled={isDisabled}
                placeholder={placeholder}
                menuPortalTarget={isMounted ? document.body : null}
                menuPlacement="auto"
                noOptionsMessage={({ inputValue }) =>
                    allowAddNew ? (
                        <div className={styles.addBtn} onClick={() => handleOnCreate(inputValue)}>
                            הוסף את: "{inputValue}" לרשימה
                        </div>
                    ) : (
                        <div>לא נמצאו אפשרויות</div>
                    )
                }
                styles={customStyles(error || "", hasBorder, true, backgroundColor)}
                classNamePrefix="react-select"
            />

            {error && <p className={styles.errorText}>{error}</p>}
        </div>
    );
};

export default InputSelect;
