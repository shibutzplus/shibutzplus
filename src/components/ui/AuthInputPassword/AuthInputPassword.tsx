import React, { InputHTMLAttributes, useState } from "react";
import styles from "./AuthInputPassword.module.css";

interface AuthInputPasswordProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const AuthInputPassword: React.FC<AuthInputPasswordProps> = ({ 
  label, 
  error, 
  className, 
  id,
  ...props 
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className={styles.inputContainer}>
      {label && <label htmlFor={id} className={styles.label}>{label}</label>}
      <div className={styles.passwordWrapper}>
        <input 
          id={id}
          type={showPassword ? "text" : "password"}
          className={`${styles.input} ${error ? styles.inputError : ''} ${className || ''}`}
          {...props} 
        />
        <button 
          type="button" 
          className={styles.toggleButton}
          onClick={togglePasswordVisibility}
          aria-label={showPassword ? "הסתר סיסמה" : "הצג סיסמה"}
        >
          {showPassword ? "הסתר" : "הצג"}
        </button>
      </div>
      {error && <p className={styles.errorText}>{error}</p>}
    </div>
  );
};

export default AuthInputPassword;
