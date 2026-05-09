"use client";

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import styles from "./Button.module.css";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "success";
type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  loading?: boolean;
  fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      leftIcon,
      rightIcon,
      loading = false,
      fullWidth = false,
      className,
      children,
      disabled,
      ...rest
    },
    ref
  ) => {
    const classes = [
      styles.button,
      styles[`variant-${variant}`],
      styles[`size-${size}`],
      fullWidth ? styles.fullWidth : "",
      loading ? styles.loading : "",
      className ?? "",
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <button
        ref={ref}
        className={classes}
        disabled={disabled || loading}
        {...rest}
      >
        {loading ? (
          <span className={styles.spinner} aria-hidden />
        ) : (
          leftIcon && <span className={styles.icon}>{leftIcon}</span>
        )}
        {children && <span className={styles.label}>{children}</span>}
        {!loading && rightIcon && <span className={styles.icon}>{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = "Button";
