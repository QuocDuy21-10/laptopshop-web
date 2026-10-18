"use client";

import * as RadixCheckbox from "@radix-ui/react-checkbox";
import { Check } from "lucide-react";
import styles from "./Checkbox.module.scss";

type Props = {
  id: string;
  label: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
};

export function Checkbox({ id, label, checked, onCheckedChange, disabled }: Props) {
  return (
    <div className={styles.row}>
      <RadixCheckbox.Root
        id={id}
        className={styles.box}
        checked={checked}
        disabled={disabled}
        onCheckedChange={(value) => onCheckedChange(value === true)}
      >
        <RadixCheckbox.Indicator className={styles.indicator}>
          <Check size={14} aria-hidden="true" />
        </RadixCheckbox.Indicator>
      </RadixCheckbox.Root>
      <label htmlFor={id} className={styles.label}>
        {label}
      </label>
    </div>
  );
}
