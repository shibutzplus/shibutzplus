"use client";

import React, { useId, useState, useEffect } from "react";
import Select from "react-select";
import styles from "./InputGroupSelect.module.css";
import { customStyles } from "@/style/selectStyle";

export interface GroupOption {
  readonly label: string;
  readonly options: { value: string; label: string }[];
}

export interface InputGroupSelectProps {
  label?: string;
  options: GroupOption[];
  error?: string;
  id?: string;
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  isSearchable?: boolean;
  isDisabled?: boolean;
  hasBorder?: boolean;
  backgroundColor?: "white" | "transparent";
  isClearable?: boolean;
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
  isDisabled = false,
  hasBorder = false,
  backgroundColor = "white",
  isClearable = false,
}) => {
  const [selectedOption, setSelectedOption] = useState<{ value: string; label: string } | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const selectInstanceId = useId();

  // Flatten all options to find selected
  useEffect(() => {
    if (value) {
      const allOptions = options.flatMap(group => group.options);
      const found = allOptions.find(opt => opt.value === value);
      setSelectedOption(found || null);
    } else {
      setSelectedOption(null);
    }
  }, [value, options]);

  useEffect(() => {
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
        onChange={option => {
          setSelectedOption(option as any);
          onChange(option ? (option as any).value : "");
        }}
        options={options}
        isSearchable={isSearchable}
        isClearable={isClearable}
        isDisabled={isDisabled}
        placeholder={placeholder}
        menuPortalTarget={isMounted ? document.body : null}
        menuPlacement="auto"
        formatGroupLabel={formatGroupLabel}
        styles={customStyles(error || "", hasBorder, true, backgroundColor)}
        classNamePrefix="react-select"
      />
      {error && <p className={styles.errorText}>{error}</p>}
    </div>
  );
};

export default InputGroupSelect;
