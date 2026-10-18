import type { ButtonHTMLAttributes, Ref } from "react";
import { cx } from "@/lib/cx";
import { Spinner } from "../Spinner/Spinner";
import styles from "./Button.module.scss";

type Variant = "primary" | "secondary" | "danger" | "ghost";
type Size = "sm" | "md" | "lg";
type Options = { variant?: Variant; size?: Size; fullWidth?: boolean };

export const buttonClassName = ({ variant = "primary", size = "md", fullWidth }: Options = {}) =>
  cx(styles.button, styles[variant], styles[size], fullWidth && styles.full);

type Props = ButtonHTMLAttributes<HTMLButtonElement> &
  Options & { loading?: boolean; ref?: Ref<HTMLButtonElement> };

export function Button({
  variant,
  size,
  fullWidth,
  loading = false,
  disabled,
  className,
  children,
  type = "button",
  ...rest
}: Props) {
  return (
    <button
      type={type}
      className={cx(buttonClassName({ variant, size, fullWidth }), className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading && <Spinner size={16} />}
      {children}
    </button>
  );
}
