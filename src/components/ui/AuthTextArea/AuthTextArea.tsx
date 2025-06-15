import React, { TextareaHTMLAttributes } from "react";
import styles from "./AuthTextArea.module.css";

interface AuthTextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

const AuthTextArea: React.FC<AuthTextAreaProps> = ({ 
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

export default AuthTextArea;
