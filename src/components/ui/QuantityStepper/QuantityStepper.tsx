"use client";

import { Minus, Plus } from "lucide-react";
import { useState } from "react";
import styles from "./QuantityStepper.module.scss";

type Props = {
  value: number;
  min?: number;
  max: number;
  onChange: (value: number) => void;
  disabled?: boolean;
  label?: string;
};

export function QuantityStepper({ value, min = 1, max, onChange, disabled, label = "Số lượng" }: Props) {
  const [draft, setDraft] = useState<string | null>(null);
  const clamp = (n: number) => Math.min(max, Math.max(min, n));
  const commit = () => {
    if (draft === null) return;
    const n = Math.trunc(Number(draft));
    setDraft(null);
    const next = Number.isFinite(n) ? clamp(n) : value;
    if (next !== value) onChange(next);
  };

  return (
    <div className={styles.stepper} role="group" aria-label={label}>
      <button
        type="button"
        className={styles.step}
        aria-label="Giảm"
        disabled={disabled || value <= min}
        onClick={() => onChange(clamp(value - 1))}
      >
        <Minus size={16} aria-hidden="true" />
      </button>
      <input
        type="number"
        inputMode="numeric"
        className={styles.input}
        aria-label={label}
        min={min}
        max={max}
        disabled={disabled}
        value={draft ?? value}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") commit();
        }}
      />
      <button
        type="button"
        className={styles.step}
        aria-label="Tăng"
        disabled={disabled || value >= max}
        onClick={() => onChange(clamp(value + 1))}
      >
        <Plus size={16} aria-hidden="true" />
      </button>
    </div>
  );
}
