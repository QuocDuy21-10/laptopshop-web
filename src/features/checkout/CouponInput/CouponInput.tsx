import { useState } from "react";
import { Button } from "@/components/ui/Button/Button";
import { TextField } from "@/components/ui/TextField/TextField";
import { errorMessage } from "@/lib/api/errors";
import styles from "./CouponInput.module.scss";

export function CouponInput({ value, onApply, error }: { value: string; onApply: (code: string) => void; error?: unknown }) {
  const [draft, setDraft] = useState(value);
  return (
    <div className={styles.wrap} aria-live="polite">
      <TextField label="Mã giảm giá" value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Nhập mã coupon" />
      <Button type="button" variant="secondary" onClick={() => onApply(draft.trim())}>Áp dụng</Button>
      {Boolean(error) && <p className={styles.error}>{errorMessage(error)}</p>}
    </div>
  );
}
