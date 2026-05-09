import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import styles from "./Card.module.css";

type CardVariant = "default" | "glass" | "gradient" | "outlined";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  hoverable?: boolean;
  padding?: "none" | "sm" | "md" | "lg";
  children?: ReactNode;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      variant = "default",
      hoverable = false,
      padding = "md",
      className,
      children,
      ...rest
    },
    ref
  ) => {
    const classes = [
      styles.card,
      styles[`variant-${variant}`],
      styles[`padding-${padding}`],
      hoverable ? styles.hoverable : "",
      className ?? "",
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <div ref={ref} className={classes} {...rest}>
        {children}
      </div>
    );
  }
);

Card.displayName = "Card";

export const CardHeader = ({
  className,
  children,
  ...rest
}: HTMLAttributes<HTMLDivElement>) => (
  <div className={`${styles.header} ${className ?? ""}`} {...rest}>
    {children}
  </div>
);

export const CardTitle = ({
  className,
  children,
  ...rest
}: HTMLAttributes<HTMLHeadingElement>) => (
  <h3 className={`${styles.title} ${className ?? ""}`} {...rest}>
    {children}
  </h3>
);

export const CardDescription = ({
  className,
  children,
  ...rest
}: HTMLAttributes<HTMLParagraphElement>) => (
  <p className={`${styles.description} ${className ?? ""}`} {...rest}>
    {children}
  </p>
);

export const CardBody = ({
  className,
  children,
  ...rest
}: HTMLAttributes<HTMLDivElement>) => (
  <div className={`${styles.body} ${className ?? ""}`} {...rest}>
    {children}
  </div>
);

export const CardFooter = ({
  className,
  children,
  ...rest
}: HTMLAttributes<HTMLDivElement>) => (
  <div className={`${styles.footer} ${className ?? ""}`} {...rest}>
    {children}
  </div>
);
