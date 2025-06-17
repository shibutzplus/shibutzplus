import React, { InputHTMLAttributes } from "react";
import styles from "./InputText.module.css";

interface InputTextProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const InputText: React.FC<InputTextProps> = ({ 
  label, 
  error, 
  className, 
  id,
  ...props 
}) => {
  return (
    <div className={styles.inputContainer}>
      {label && <label htmlFor={id} className={styles.label}>{label}</label>}
      <input 
        id={id}
        className={`${styles.input} ${error ? styles.inputError : ''} ${className || ''}`}
        {...props} 
      />
      {error && <p className={styles.errorText}>{error}</p>}
    </div>
  );
};

export default InputText;
