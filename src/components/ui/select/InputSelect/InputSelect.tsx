"use client";

import React, { useEffect, useId, useMemo, useState } from "react";
import Select from "react-select";
import styles from "./InputSelect.module.css";
import { SelectOption } from "@/models/types";
import { customStyles } from "@/style/selectStyle";
import AddToSelectBtn from "../../buttons/AddToSelectBtn/AddToSelectBtn";

type Props = {
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
};

const InputSelect: React.FC<Props> = (props) => {
    const {
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
    } = props;

    const [options, setOptions] = useState<SelectOption[]>(initialOptions);
    const [selectedOption, setSelectedOption] = useState<SelectOption | null>(null);
    const [isMounted, setIsMounted] = useState(false);

    const uid = useId();
    const resolvedId = useMemo(() => id ?? `select-${uid}`, [id, uid]);
    const inputId = `react-select-${resolvedId}-input`;

    useEffect(() => setIsMounted(true), []);

    useEffect(() => setOptions(initialOptions), [initialOptions]);

    useEffect(() => {
        if (value) {
            const opt = options.find((o) => o.value === value);
            setSelectedOption(opt ?? null);
        } else {
            setSelectedOption(null);
        }
    }, [value, options]);

    const handleOnCreate = async (inputValue: string) => {
        const exists = options.some((o) => o.label.toLowerCase() === inputValue.toLowerCase());
        if (!exists && allowAddNew && onCreate) {
            const valueId = await onCreate(inputValue);
            if (valueId) {
                const newOption = { value: valueId, label: inputValue };
                const updated = [...options, newOption];
                setOptions(updated);
                setSelectedOption(newOption);
                onChange(valueId); // אופציונלי: לסנכרן כלפי מעלה
            }
        }
    };

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
                isSearchable={isSearchable}
                isClearable={isClearable}
                isDisabled={isDisabled}
                placeholder={placeholder}
                menuPortalTarget={typeof window !== "undefined" ? document.body : undefined}
                menuPlacement="auto"
                noOptionsMessage={({ inputValue }) =>
                    allowAddNew && onCreate ? (
                        <AddToSelectBtn
                            onClick={() => handleOnCreate(inputValue)}
                            label={inputValue}
                        />
                    ) : (
                        <div>לא נמצאו אפשרויות</div>
                    )
                }
                onKeyDown={(e) => {
                    if (
                        allowAddNew &&
                        e.key === "Enter" &&
                        typeof e.target === "object" &&
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
                styles={customStyles(error || "", hasBorder, true, backgroundColor)}
                classNamePrefix="react-select"
            />
            {error && <p className={styles.errorText}>{error}</p>}
        </div>
    );
};

export default InputSelect;
