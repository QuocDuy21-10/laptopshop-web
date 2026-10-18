"use client";

import * as RadixDialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import type { ReactNode } from "react";
import { cx } from "@/lib/cx";
import styles from "./Dialog.module.scss";

type Props = {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: ReactNode;
  title: string;
  description?: string;
  variant?: "center" | "sheet";
  children?: ReactNode;
};

export function Dialog({ open, onOpenChange, trigger, title, description, variant = "center", children }: Props) {
  return (
    <RadixDialog.Root open={open} onOpenChange={onOpenChange}>
      {trigger && <RadixDialog.Trigger asChild>{trigger}</RadixDialog.Trigger>}
      <RadixDialog.Portal>
        <RadixDialog.Overlay className={styles.overlay} />
        <RadixDialog.Content
          className={cx(styles.content, styles[variant])}
          {...(description ? {} : { "aria-describedby": undefined })}
        >
          <div className={styles.header}>
            <RadixDialog.Title className={styles.title}>{title}</RadixDialog.Title>
            <RadixDialog.Close className={styles.close} aria-label="Đóng">
              <X size={20} aria-hidden="true" />
            </RadixDialog.Close>
          </div>
          {description && (
            <RadixDialog.Description className={styles.description}>{description}</RadixDialog.Description>
          )}
          {children}
        </RadixDialog.Content>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  );
}
