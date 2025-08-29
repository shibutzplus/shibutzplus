"use client";

import React, { useEffect, useId, useMemo, useState } from "react";
import Select from "react-select";
import styles from "./InputSearchSelect.module.css";
import { SelectOption } from "@/models/types";
import { customStyles } from "@/style/selectStyle";

interface InputSearchSelectProps {
    label?: string;
    options: SelectOption[];
    value?: string;
    onChange: (value: string) => void;
    placeholder?: string;
    error?: string;
    isDisabled?: boolean;
    hasBorder?: boolean;
    backgroundColor?: "white" | "transparent";
    isClearable?: boolean;
}

const InputSearchSelect: React.FC<InputSearchSelectProps> = ({
    label,
    options: initialOptions,
    value,
    onChange,
    placeholder = "הקלד לחיפוש...",
    error,
    isDisabled = false,
    hasBorder = false,
    backgroundColor = "white",
    isClearable = false,
}) => {
    const [options, setOptions] = useState<SelectOption[]>(initialOptions);
    const [selectedOption, setSelectedOption] = useState<SelectOption | null>(null);
    const uid = useId();
    const resolvedId = useMemo(() => `search-select-${uid}`, [uid]);
    const inputId = `react-select-${resolvedId}-input`;

    useEffect(() => setOptions(initialOptions), [initialOptions]);

    useEffect(() => {
        if (value) {
            const opt = options.find((o) => o.value === value);
            setSelectedOption(opt ?? null);
        } else {
            setSelectedOption(null);
        }
    }, [value, options]);

    const handleChange = (opt: SelectOption | null) => {
        setSelectedOption(opt);
        onChange(opt ? opt.value : "");
    };

    return (
        <div className={styles.selectContainer}>
            {label && (
                <label htmlFor={resolvedId} className={styles.label}>
                    {label}
                </label>
            )}
            <Select
                id={resolvedId}
                inputId={inputId}
                instanceId={resolvedId}
                value={selectedOption}
                onChange={handleChange}
                options={options}
                isSearchable={true}
                isClearable={isClearable}
                isDisabled={isDisabled}
                placeholder={placeholder}
                menuPortalTarget={typeof window !== "undefined" ? document.body : undefined}
                menuPlacement="auto"
                noOptionsMessage={({ inputValue }) => (
                    <div>לא נמצאו אפשרויות</div>
                )}
                styles={customStyles(error || "", hasBorder, true, backgroundColor)}
                classNamePrefix="react-select"
            />
            {error && <div className={styles.errorText}>{error}</div>}
        </div>
    );
};

export default InputSearchSelect;
