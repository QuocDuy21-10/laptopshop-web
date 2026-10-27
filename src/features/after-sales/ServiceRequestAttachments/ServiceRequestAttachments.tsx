"use client";

import { useRef, useState } from "react";
import { useUploadAfterSalesAttachments } from "../hooks";
import { ServiceAttachmentGallery } from "../ServiceAttachmentGallery/ServiceAttachmentGallery";
import styles from "./ServiceRequestAttachments.module.scss";

export function ServiceRequestAttachments({ userId, requestId, itemId, disabled = false }: { userId: number; requestId: number; itemId: number; disabled?: boolean }) {
  const input = useRef<HTMLInputElement>(null);
  const upload = useUploadAfterSalesAttachments(userId, requestId, itemId);
  const [operation, setOperation] = useState<{ files: File[]; uploadKey: string } | null>(null);
  const begin = (files: File[]) => {
    const next = { files, uploadKey: typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random()}` };
    setOperation(next);
    upload.mutate(next);
  };
  return <div className={styles.box}>
    {!disabled && <><input ref={input} type="file" accept="image/jpeg,image/png,image/webp" multiple hidden onChange={(event) => { const files = Array.from(event.target.files ?? []); if (files.length) begin(files); }} /><ButtonLike onClick={() => input.current?.click()} disabled={upload.isPending}>Thêm ảnh</ButtonLike></>}
    {upload.isError && <><p role="alert">Không thể tải ảnh. Bạn có thể thử lại.</p>{operation && <ButtonLike onClick={() => upload.mutate(operation)} disabled={upload.isPending}>Thử lại</ButtonLike>}</>}
    <ServiceAttachmentGallery userId={userId} requestId={requestId} itemId={itemId} />
  </div>;
}

function ButtonLike({ onClick, disabled, children }: { onClick: () => void; disabled?: boolean; children: string }) { return <button type="button" className={styles.button} onClick={onClick} disabled={disabled} aria-label={children}>{children}</button>; }
