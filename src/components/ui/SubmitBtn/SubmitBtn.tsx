import React from 'react';
import styles from './SubmitBtn.module.css';

interface SubmitBtnProps {
  type: 'submit' | 'button' | 'reset';
  onClick?: () => void;
  isLoading: boolean;
  loadingText: string;
  buttonText: string;
  error?: string;
  disabled?: boolean;
}

const SubmitBtn: React.FC<SubmitBtnProps> = ({
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

export default SubmitBtn;
