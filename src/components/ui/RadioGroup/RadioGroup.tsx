import React from "react";
import styles from "./RadioGroup.module.css";
import { SelectOption } from "@/models/types";

interface RadioGroupProps {
  label?: string;
  name: string;
  options: SelectOption[];
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
}

const RadioGroup: React.FC<RadioGroupProps> = ({
  label,
  name,
  options,
  value,
  onChange,
  error,
}) => {
  return (
    <div className={styles.radioGroupContainer}>
      {label && <label className={styles.label}>{label}</label>}
      <div className={styles.optionsContainer}>
        {options.map((option) => (
          <div key={option.value} className={styles.radioOption}>
            <input
              type="radio"
              id={`${name}-${option.value}`}
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={onChange}
              className={styles.radioInput}
            />
            <label htmlFor={`${name}-${option.value}`} className={styles.radioLabel}>
              {option.label}
            </label>
          </div>
        ))}
      </div>
      {error && <p className={styles.errorText}>{error}</p>}
    </div>
  );
};

export default RadioGroup;
