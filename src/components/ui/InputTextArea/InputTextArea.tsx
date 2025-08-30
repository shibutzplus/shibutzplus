import React, { TextareaHTMLAttributes, useLayoutEffect, useRef } from "react";
import styles from "./InputTextArea.module.css";

interface InputTextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  autoGrow?: boolean; // default: true
}

const InputTextArea: React.FC<InputTextAreaProps> = ({
  label,
  error,
  className,
  id,
  autoGrow = true,
  rows = 1,
  value,
  onInput,
  ...props
}) => {
  const ref = useRef<HTMLTextAreaElement>(null);

  const resize = (el: HTMLTextAreaElement | null) => {
    if (!el) return;
    el.style.height = "auto";
    el.style.overflow = "hidden";
    el.style.height = `${el.scrollHeight}px`;
  };

  // grow on mount and whenever controlled value changes
  useLayoutEffect(() => {
    if (autoGrow) resize(ref.current);
  }, [value, autoGrow]);

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (autoGrow) resize(e.currentTarget); // typing/paste
    onInput?.(e);
  };

  return (
    <div className={styles.textareaContainer}>
      {label && (
        <label htmlFor={id} className={styles.label}>
          {label}
        </label>
      )}
      <textarea
        id={id}
        ref={ref}
        rows={rows}
        className={`${styles.textarea} ${error ? styles.textareaError : ""} ${className || ""}`}
        onInput={handleInput}
        value={value}
        style={{ height: "auto" }}
        {...props}
      />
      {error && <p className={styles.errorText}>{error}</p>}
    </div>
  );
};

export default InputTextArea;
