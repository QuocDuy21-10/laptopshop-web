"use client";

import { useRef } from "react";
import { useUploadAfterSalesAttachments } from "../hooks";
import styles from "./ServiceRequestAttachments.module.scss";

export function ServiceRequestAttachments({ userId, requestId, itemId }: { userId: number; requestId: number; itemId: number }) {
  const input = useRef<HTMLInputElement>(null);
  const upload = useUploadAfterSalesAttachments(userId, requestId, itemId);
  return <div className={styles.box}><input ref={input} type="file" accept="image/jpeg,image/png,image/webp" multiple hidden onChange={(event) => { const files = Array.from(event.target.files ?? []); if (files.length) upload.mutate(files); }} /><ButtonLike onClick={() => input.current?.click()} disabled={upload.isPending}>Thêm ảnh</ButtonLike>{upload.isError && <p role="alert">Không thể tải ảnh. Bạn có thể thử lại.</p>}</div>;
}

function ButtonLike({ onClick, disabled, children }: { onClick: () => void; disabled?: boolean; children: string }) { return <button type="button" className={styles.button} onClick={onClick} disabled={disabled} aria-label={children}>{children}</button>; }
