import type { ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

/*
 * BLOCK: Button (React Component)
 * PURPOSE: The button primitive for the pages outside the editor (landing, gallery). Styled only
 *          through `ui-button` classes in styles/pages.css, so a design system can restyle or
 *          replace it without touching the pages that use it.
 */
export function Button({ variant = "secondary", className, type = "button", ...rest }: ButtonProps) {
  const classes = `ui-button ui-button--${variant}${className ? ` ${className}` : ""}`;

  return <button type={type} className={classes} {...rest} />;
}
