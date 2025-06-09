import React from 'react';
import styles from './AuthBtn.module.css';

interface AuthBtnProps {
  type: 'submit' | 'button' | 'reset';
  onClick?: () => void;
  isLoading: boolean;
  loadingText: string;
  buttonText: string;
  error?: string;
  disabled?: boolean;
}

const AuthBtn: React.FC<AuthBtnProps> = ({
  type = 'submit',
  onClick,
  isLoading,
  loadingText,
  buttonText,
  error,
  disabled = false,
}) => {
  return (
    <div className={styles.buttonContainer}>
      <button
        type={type}
        className={styles.button}
        onClick={onClick}
        disabled={isLoading || disabled}
      >
        {isLoading ? loadingText : buttonText}
      </button>
      
      {error && <p className={styles.error}>{error}</p>}
    </div>
  );
};

export default AuthBtn;
