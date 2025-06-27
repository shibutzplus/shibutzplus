"use client";

import React, { useState, useEffect, useId } from "react";
import Select from "react-select";
import styles from "./InputSelect.module.css";
import { SelectOption } from "@/models/types";
import { customStyles } from "@/style/selectStyle";

interface InputSelectProps {
    label?: string;
    options: SelectOption[];
    error?: string;
    id?: string;
    value?: string;
    onChange?: any;
    onOptionsChange?: any;
    placeholder?: string;
    isSearchable?: boolean;
    allowAddNew?: boolean;
    isDisabled?: boolean;
    isClearable?: boolean;
}

const InputSelect: React.FC<InputSelectProps> = ({
    label,
    options: initialOptions,
    error,
    id,
    value,
    onChange,
    onOptionsChange,
    placeholder = "בחר אופציה...",
    isSearchable = true,
    allowAddNew = true,
    isDisabled = false,
    isClearable = false,
}) => {
    const [options, setOptions] = useState<SelectOption[]>(initialOptions);
    const [selectedOption, setSelectedOption] = useState<SelectOption | null>(null);

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

    const handleOnCreate = (inputValue: string) => {
        const newOption: SelectOption = {
            value: inputValue,
            label: inputValue,
        };

        const updatedOptions = [...options, newOption];
        setOptions(updatedOptions);
        setSelectedOption(newOption);

        if (onOptionsChange) {
            onOptionsChange(updatedOptions);
        }
        if (onChange) {
            onChange(newOption.value);
        }
    };

    const handleChange = (option: SelectOption | null) => {
        setSelectedOption(option);

        if (onChange) {
            onChange(option ? option.value : "");
        }
    };

    const handleKeyDown = (event: any) => {
        if (allowAddNew && event.key === "Enter" && event.target.value) {
            const inputValue = event.target.value;
            // Check if the option already exists
            const exists = options.some(
                (option) => option.label.toLowerCase() === inputValue.toLowerCase(),
            );

            if (!exists) {
                handleOnCreate(inputValue);
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
                value={selectedOption}
                onChange={handleChange}
                options={options}
                isSearchable={isSearchable}
                isClearable={isClearable}
                isDisabled={isDisabled}
                placeholder={placeholder}
                noOptionsMessage={({ inputValue }) =>
                    allowAddNew && inputValue
                        ? `לחץ Enter בשביל להוסיף את "${inputValue}"`
                        : "לא נמצאו אפשרויות"
                }
                onKeyDown={handleKeyDown}
                styles={customStyles(error || "")}
                classNamePrefix="react-select"
            />

            {error && <p className={styles.errorText}>{error}</p>}
        </div>
    );
};

export default InputSelect;
