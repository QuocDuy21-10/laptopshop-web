"use client";

import { CircleAlert, Eye, EyeOff } from "lucide-react";
import { useId, useState, type InputHTMLAttributes, type Ref } from "react";
import { cx } from "@/lib/cx";
import styles from "./TextField.module.scss";

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
  invalid?: boolean;
  hint?: string;
  revealable?: boolean;
  ref?: Ref<HTMLInputElement>;
};

export function TextField({ label, error, invalid, hint, id, required, className, revealable, type, ref, ...rest }: Props) {
  const autoId = useId();
  const [revealed, setRevealed] = useState(false);
  const inputId = id ?? autoId;
  const hintId = hint && !error ? `${inputId}-hint` : undefined;
  const errorId = error ? `${inputId}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div className={cx(styles.field, className)}>
      <label htmlFor={inputId} className={styles.label}>
        {label}
        {required && (
          <span className={styles.required} aria-hidden="true">
            {" "}
            *
          </span>
        )}
      </label>
      <div className={styles.control}>
        <input
          ref={ref}
          id={inputId}
          type={revealable && revealed ? "text" : type}
          className={cx(styles.input, revealable && styles.revealable, (error || invalid) && styles.invalid)}
          aria-invalid={error || invalid ? true : undefined}
          aria-describedby={describedBy}
          aria-required={required || undefined}
          {...rest}
        />
        {revealable && (
          <button
            type="button"
            className={styles.toggle}
            aria-label={revealed ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
            aria-pressed={revealed}
            onClick={() => setRevealed((v) => !v)}
          >
            {revealed ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
          </button>
        )}
      </div>
      {hintId && (
        <p id={hintId} className={styles.hint}>
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className={styles.error}>
          <CircleAlert size={14} aria-hidden="true" />
          {error}
        </p>
      )}
    </div>
  );
}
