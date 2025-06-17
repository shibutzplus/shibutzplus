import React, { TextareaHTMLAttributes } from "react";
import styles from "./InputTextArea.module.css";

interface InputTextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

const InputTextArea: React.FC<InputTextAreaProps> = ({ 
  label, 
  error, 
  className, 
  id,
  ...props 
}) => {
  return (
    <div className={styles.textareaContainer}>
      {label && <label htmlFor={id} className={styles.label}>{label}</label>}
      <textarea 
        id={id}
        className={`${styles.textarea} ${error ? styles.textareaError : ''} ${className || ''}`}
        {...props} 
      />
      {error && <p className={styles.errorText}>{error}</p>}
    </div>
  );
};

export default InputTextArea;
