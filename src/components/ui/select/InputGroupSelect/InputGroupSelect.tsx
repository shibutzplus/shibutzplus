"use client";

import React, { useState, useEffect, useRef } from "react";
import Select, { StylesConfig } from "react-select";
import styles from "./InputGroupSelect.module.css";
import { customStyles } from "@/style/selectStyle";
import { GroupOption, SelectOption } from "@/models/types";
import AddToSelectBtn from "../../buttons/AddToSelectBtn/AddToSelectBtn";
import { createNewSelectOption_btnText } from "@/utils/format";

export interface InputGroupSelectProps {
    label?: string;
    options: GroupOption[];
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
    onCreate?: (value: string) => Promise<void>;
    createBtnText?: string;
}

const formatGroupLabel = (data: GroupOption) => (
    <div className={styles.groupStyles}>
        <span>{data.label}</span>
        <span className={styles.groupBadgeStyles}>{data.options.length}</span>
    </div>
);

const InputGroupSelect: React.FC<InputGroupSelectProps> = ({
    label,
    options,
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
}) => {
    const [selectedOption, setSelectedOption] = useState<SelectOption | null>(null);

    useEffect(() => {
        if (value) {
            const allOptions = options.flatMap((group) => group.options);
            const found = allOptions.find((opt) => opt.value === value);
            setSelectedOption(found || { value, label: value });
        } else {
            setSelectedOption(null);
        }
    }, [value, options]);

    const handleOnCreate = async (inputValue: string) => {
        const exists = options.some(
            (option) => option.label.toLowerCase() === inputValue.toLowerCase()
        );
        if (!exists && isAllowAddNew && onCreate) {
            await onCreate(inputValue);
            const newOption: SelectOption = { value: inputValue, label: inputValue };
            setSelectedOption(newOption);
        }
    };

    const handleChange = (option: SelectOption | null) => {
        setSelectedOption(option);
        onChange(option ? option.value : "");
    };

    const selectRef = useRef<any>(null);

    const baseStyles = customStyles(error || "", hasBorder, true, backgroundColor);

    const stylesOverride: StylesConfig<SelectOption, false, GroupOption> = {
        ...(baseStyles as StylesConfig<SelectOption, false, GroupOption>),
        control: (prov: any, state: any) => {
            const b =
                typeof (baseStyles as any).control === "function"
                    ? (baseStyles as any).control(prov, state)
                    : prov;
            return {
                ...b,
                border: "none",
                boxShadow: state.isFocused ? "0 0 0 1px #dbe1e7ff" : "0 1px 2px rgba(0,0,0,0.08)",
                backgroundColor: "#ffffff",
                borderRadius: 4,
                minHeight: 32,
            };
        },
    };

    return (
        <div className={styles.selectContainer}>
            {label && (
                <label htmlFor={id} className={styles.label}>
                    {label}
                </label>
            )}
            <Select<SelectOption, false, GroupOption>
                ref={selectRef}
                inputId={id}
                value={selectedOption}
                onChange={handleChange}
                options={options}
                isSearchable={isSearchable}
                isClearable={isClearable}
                isDisabled={isDisabled}
                placeholder={placeholder}
                menuPlacement="auto"
                formatGroupLabel={formatGroupLabel}
                noOptionsMessage={({ inputValue }) =>
                    isAllowAddNew && inputValue.trim() !== "" ? (
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
                        "value" in e.target
                    ) {
                        const inputValue = (e.target as HTMLInputElement).value;
                        if (inputValue.trim() === "") return;
                        const allOptions = options.flatMap((group) => group.options);
                        const exists = allOptions.some(
                            (opt) => opt.label.toLowerCase() === inputValue.toLowerCase()
                        );
                        if (!exists && inputValue.trim().length > 0) {
                            e.preventDefault();
                            handleOnCreate(inputValue);
                        }
                    }
                }}
                styles={stylesOverride}
                classNamePrefix="react-select"
            />
            {error && <p className={styles.errorText}>{error}</p>}
        </div>
    );
};

export default InputGroupSelect;
