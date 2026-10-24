"use client";
import { ServiceRequestActions } from "./ServiceRequestActions";
import { ServiceQuoteEditor } from "./ServiceQuoteEditor";
import { WarrantyVerificationForm } from "./WarrantyVerificationForm";
import { ServiceAttachmentPanel } from "./ServiceAttachmentPanel";
import type { AdminAfterSalesRequest } from "@/lib/api/types";
export function ServiceRequestItems({ request }: { request: Pick<AdminAfterSalesRequest, "id" | "type" | "items"> }) { return <div>{request.items.map((item) => <section key={item.id}><h2>{item.deviceLabel}</h2><ServiceRequestActions requestId={request.id} item={item} />{request.type === "TECHNICAL_SUPPORT" && <ServiceQuoteEditor requestId={request.id} itemId={item.id} expectedVersion={item.version} deviceLabel={item.deviceLabel} />}<WarrantyVerificationForm requestId={request.id} itemId={item.id} expectedVersion={item.version} visible={item.coverageAtCreation === "REQUIRES_VERIFICATION" && !item.warrantyVerification} /><ServiceAttachmentPanel requestId={request.id} itemId={item.id} /></section>)}</div>; }
