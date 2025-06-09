import React, { SelectHTMLAttributes } from "react";
import styles from "./AuthSelect.module.css";

interface Option {
  value: string;
  label: string;
}

interface AuthSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: Option[];
  error?: string;
}

const AuthSelect: React.FC<AuthSelectProps> = ({ 
  label, 
  options,
  error, 
  className, 
  id,
  ...props 
}) => {
  return (
    <div className={styles.selectContainer}>
      {label && <label htmlFor={id} className={styles.label}>{label}</label>}
      <select 
        id={id}
        className={`${styles.select} ${error ? styles.selectError : ''} ${className || ''}`}
        {...props} 
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <p className={styles.errorText}>{error}</p>}
    </div>
  );
};

export default AuthSelect;
