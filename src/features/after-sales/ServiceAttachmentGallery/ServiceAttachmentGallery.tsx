"use client";

import { Alert } from "@/components/ui/Alert/Alert";
import { useAfterSalesAttachments } from "../hooks";
import styles from "./ServiceAttachmentGallery.module.scss";

export function ServiceAttachmentGallery({ userId, requestId, itemId }: { userId: number; requestId: number; itemId: number }) {
  const attachments = useAfterSalesAttachments(userId, requestId, itemId);
  if (attachments.isError) return <Alert tone="error" title="Không thể tải ảnh đính kèm" />;
  if (!attachments.data?.data.length) return null;
  return <div className={styles.gallery} aria-label="Ảnh đính kèm">{attachments.data.data.map((attachment) => <a key={attachment.id} href={attachment.url} target="_blank" rel="noreferrer"><img src={attachment.url} alt="Ảnh bằng chứng hậu mãi" width={120} height={120} /></a>)}</div>;
}
