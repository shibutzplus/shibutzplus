import React, { InputHTMLAttributes } from "react";
import styles from "./AuthInputText.module.css";

interface AuthInputTextProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const AuthInputText: React.FC<AuthInputTextProps> = ({ 
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

export default AuthInputText;
