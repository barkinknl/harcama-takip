"use client";

import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";
import styles from "./Input.module.css";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      hint,
      leftIcon,
      rightIcon,
      fullWidth = true,
      className,
      id,
      ...rest
    },
    ref
  ) => {
    const inputId =
      id ?? `input-${Math.random().toString(36).slice(2, 9)}`;

    const wrapperClasses = [
      styles.wrapper,
      fullWidth ? styles.fullWidth : "",
      error ? styles.hasError : "",
      className ?? "",
    ]
      .filter(Boolean)
      .join(" ");

    const fieldClasses = [
      styles.field,
      leftIcon ? styles.hasLeft : "",
      rightIcon ? styles.hasRight : "",
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <div className={wrapperClasses}>
        {label && (
          <label htmlFor={inputId} className={styles.label}>
            {label}
          </label>
        )}
        <div className={styles.inputBox}>
          {leftIcon && <span className={styles.iconLeft}>{leftIcon}</span>}
          <input ref={ref} id={inputId} className={fieldClasses} {...rest} />
          {rightIcon && <span className={styles.iconRight}>{rightIcon}</span>}
        </div>
        {error ? (
          <span className={styles.error}>{error}</span>
        ) : hint ? (
          <span className={styles.hint}>{hint}</span>
        ) : null}
      </div>
    );
  }
);

Input.displayName = "Input";
