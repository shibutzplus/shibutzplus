import React, { useEffect, useId, useRef, useState } from "react";
import styles from "./InputTextSelect.module.css";
import { SelectOption } from "@/models/types";
import Select, { SelectInstance } from "react-select";
import { customStyles } from "@/style/selectStyle";

type InputTextSelectProps = {
    options: SelectOption[];
    error?: string;
    id?: string;
    value?: string;
    onChange: (value: string) => void;
    placeholder?: string;
    isSearchable?: boolean;
    isDisabled?: boolean;
    hasBorder?: boolean;
    isClearable?: boolean;
};

const InputTextSelect: React.FC<InputTextSelectProps> = ({
    options: initialOptions,
    error,
    id,
    value,
    onChange,
    placeholder = "בחר אופציה...",
    isSearchable = true,
    isDisabled = false,
    hasBorder = false,
    isClearable = false,
}) => {
    const [options, setOptions] = useState<SelectOption[]>(initialOptions);
    const [selectedOption, setSelectedOption] = useState<SelectOption | null>(null);

    // Reference to the select component
    const selectRef = useRef<SelectInstance<SelectOption> | null>(null);

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

    const handleChange = (option: SelectOption | null) => {
        setSelectedOption(option);
        onChange(option ? option.value : "");
    };

    useEffect(() => {
        // Ensure document is defined (client-side only)
        if (typeof document !== "undefined") {
            // This effect runs only on client-side
        }
    }, []);

    const handleInputChange = (inputValue: string, { action }: any) => {
        if (action === "input-change" && inputValue) {
            setSelectedOption({
                value: inputValue,
                label: inputValue,
            });
        }
    };

    const handleKeyDown = (event: any) => {
        if (event.key === "Enter" && event.target.value) {
            if (selectRef.current) {
                selectRef.current.blur();
            }
        }
    };

    return (
        <div>
            <Select
                ref={selectRef}
                instanceId={selectInstanceId}
                id={id}
                value={selectedOption}
                onChange={handleChange}
                onInputChange={handleInputChange}
                options={options}
                isSearchable={isSearchable}
                isClearable={isClearable}
                isDisabled={isDisabled}
                placeholder={placeholder}
                menuPortalTarget={typeof document !== "undefined" ? document.body : null}
                menuPlacement="auto"
                onKeyDown={handleKeyDown}
                noOptionsMessage={({ inputValue }) => inputValue}
                styles={customStyles(error || "", hasBorder, false, "transparent", "#333")}
                classNamePrefix="react-select"
            />

            {error && <p className={styles.errorText}>{error}</p>}
        </div>
    );
};

export default InputTextSelect;
