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
    onChange: (value: string) => void;
    placeholder?: string;
    isSearchable?: boolean;
    allowAddNew?: boolean;
    isDisabled?: boolean;
    hasBorder?: boolean;
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
    allowAddNew = true,
    isDisabled = false,
    hasBorder = false,
    isClearable = false,
    onCreate,
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
        // Ensure document is defined (client-side only)
        if (typeof document !== 'undefined') {
            // This effect runs only on client-side
        }
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
                menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
                menuPlacement="auto"
                noOptionsMessage={({ inputValue }) => (
                    <div className={styles.addBtn} onClick={() => handleOnCreate(inputValue)}>
                        הוסף את: "{inputValue}" לרשימה
                    </div>
                )}
                styles={customStyles(error || "", hasBorder)}
                classNamePrefix="react-select"
            />

            {error && <p className={styles.errorText}>{error}</p>}
        </div>
    );
};

export default InputSelect;

// noOptionsMessage={({ inputValue }) =>
//     allowAddNew && inputValue
//         ? `לחץ Enter בשביל להוסיף את "${inputValue}"`
//         : "לא נמצאו אפשרויות"
// }

// const handleKeyDown = (event: any) => {
//     if (allowAddNew && event.key === "Enter" && event.target.value) {
//         const inputValue = event.target.value;
//         // Check if the option already exists
//         const exists = options.some(
//             (option) => option.label.toLowerCase() === inputValue.toLowerCase(),
//         );

//         if (!exists) {
//             handleOnCreate(inputValue);
//         }
//     }
// };
