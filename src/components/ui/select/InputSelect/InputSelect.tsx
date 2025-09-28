"use client";

import React, { useMemo } from "react";
import Select from "react-select";
import { SelectOption } from "@/models/types";
import { customStyles } from "@/style/selectStyle";
import { createNewSelectOption_btnText } from "@/utils/format";
import AddToSelectBtn from "../../buttons/AddToSelectBtn/AddToSelectBtn";
import styles from "./InputSelect.module.css";

// Used in: Sign-Up, Teachers Sign-In, TopActions (Annual, Daily, Teacher Portal), Annual Schedule Cell, Daily Schedule Header
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
    backgroundColor?: "#fdfbfb" | "transparent";
    isClearable?: boolean;
    onCreate?: (value: string) => Promise<string | undefined>;
    createBtnText?: string;
};

const InputSelect: React.FC<Props> = (props) => {
    const {
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
        backgroundColor = "#fdfbfb",
        isClearable = false,
        onCreate,
        createBtnText,
    } = props;

    // simple id for label association (optional)
    const resolvedId = id ?? "input-select";

    // derive selected option directly from props
    const selectedOption = useMemo(
        () => (value ? options.find((o) => o.value === value) ?? null : null),
        [value, options]
    );

    const handleChange = (opt: SelectOption | null) => {
        const next = opt?.value ?? "";
        if ((value ?? "") !== next) onChange(next);
    };

    const handleOnCreate = async (inputValue: string) => {
        if (!isAllowAddNew || !onCreate) return;
        const exists = options.some((o) => o.label.toLowerCase() === inputValue.toLowerCase());
        if (exists || !inputValue.trim()) return;
        const valueId = await onCreate(inputValue);
        if (valueId && valueId !== value) onChange(valueId);
    };

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
            clearIndicator: (p: any, s: any) => ({
                ...(base.clearIndicator ? base.clearIndicator(p, s) : p),
                marginLeft: -10,
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
                inputId={resolvedId}
                value={selectedOption}
                onChange={handleChange}
                options={options}
                isSearchable={isSearchable}
                isClearable={isClearable}
                isDisabled={isDisabled}
                placeholder={placeholder}
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
                styles={mergedStyles}
                classNamePrefix="react-select"
            />
            {error && <p className={styles.errorText}>{error}</p>}
        </div>
    );
};

export default InputSelect;
