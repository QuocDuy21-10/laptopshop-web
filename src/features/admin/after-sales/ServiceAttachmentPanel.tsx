"use client";

import { Button, Upload } from "antd";
import { useAdminAfterSalesAttachments, useUploadAdminAfterSalesAttachment } from "./hooks";

export function ServiceAttachmentPanel({ requestId, itemId }: { requestId: number; itemId: number }) {
  const attachments = useAdminAfterSalesAttachments(requestId, itemId);
  const upload = useUploadAdminAfterSalesAttachment(requestId, itemId);
  return <section aria-label="Ảnh đính kèm admin"><Upload showUploadList={false} beforeUpload={(file) => { upload.mutate({ file, uploadKey: typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}` }); return false; }}><Button loading={upload.isPending}>Thêm ảnh</Button></Upload><div>{attachments.data?.data.map((attachment) => <a key={attachment.id} href={attachment.url} target="_blank" rel="noreferrer"><img src={attachment.url} alt="Ảnh hậu mãi" width={100} height={100} /></a>)}</div></section>;
}
