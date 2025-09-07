"use client";

import React, { useEffect, useId, useMemo, useState } from "react";
import Select from "react-select";
import styles from "./InputSelect.module.css";
import { SelectOption } from "@/models/types";
import { customStyles } from "@/style/selectStyle";
import AddToSelectBtn from "../../buttons/AddToSelectBtn/AddToSelectBtn";
import { createNewSelectOption_btnText } from "@/utils/format";

type Props = {
    label?: string;
    options: SelectOption[];
    error?: string;
    id?: string;
    value?: string;
    onChange: (value: string) => void;
    placeholder?: string;
    isSearchable?: boolean;
    isAllowAddNew?: boolean;
    isDisabled?: boolean;
    hasBorder?: boolean;
    backgroundColor?: "white" | "transparent";
    isClearable?: boolean;
    onCreate?: (value: string) => Promise<string | undefined>;
    createBtnText?: string;
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
        isAllowAddNew = false,
        isDisabled = false,
        hasBorder = false,
        backgroundColor = "white",
        isClearable = false,
        onCreate,
        createBtnText,
    } = props;

    const [options, setOptions] = useState<SelectOption[]>(initialOptions);
    const [selectedOption, setSelectedOption] = useState<SelectOption | null>(null);

    const uid = useId();
    const resolvedId = useMemo(() => id ?? `select-${uid}`, [id, uid]);
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

    const handleOnCreate = async (inputValue: string) => {
        const exists = options.some((o) => o.label.toLowerCase() === inputValue.toLowerCase());
        if (!exists && isAllowAddNew && onCreate) {
            const valueId = await onCreate(inputValue);
            if (valueId) {
                const newOption = { value: valueId, label: inputValue };
                const updated = [...options, newOption];
                setOptions(updated);
                setSelectedOption(newOption);
                onChange(valueId);
            }
        }
    };

    const handleChange = (opt: SelectOption | null) => {
        setSelectedOption(opt);
        onChange(opt ? opt.value : "");
    };

    // Prevent cutting of the selected text
    const mergedStyles = useMemo(() => {
        const base = customStyles(error || "", hasBorder, true, backgroundColor) as any;
        return {
            ...base,
            valueContainer: (p: any, s: any) => ({
                ...(base.valueContainer ? base.valueContainer(p, s) : p),
                overflow: "visible",
            }),
            singleValue: (p: any, s: any) => ({
                ...(base.singleValue ? base.singleValue(p, s) : p),
                maxWidth: "none",
                overflow: "visible",
                whiteSpace: "nowrap",
            }),
        };
    }, [error, hasBorder, backgroundColor]);

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
                    isAllowAddNew && onCreate ? (
                        <AddToSelectBtn
                            onClick={() => handleOnCreate(inputValue)}
                            text={createNewSelectOption_btnText(inputValue, createBtnText)}
                        />
                    ) : (
                        <div>לא נמצאו אפשרויות</div>
                    )
                }
                onKeyDown={(e) => {
                    if (
                        isAllowAddNew &&
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
                styles={mergedStyles}
                classNamePrefix="react-select"
            />
            {error && <p className={styles.errorText}>{error}</p>}
        </div>
    );
};

export default InputSelect;
