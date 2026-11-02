"use client";
import { ServiceRequestActions } from "./ServiceRequestActions";
import { ServiceQuoteEditor } from "./ServiceQuoteEditor";
import { WarrantyVerificationForm } from "./WarrantyVerificationForm";
import { ServiceAttachmentPanel } from "./ServiceAttachmentPanel";
import type { AdminAfterSalesRequest } from "@/lib/api/types";
// the API only accepts quotes while the item is being diagnosed or awaits a decision
const QUOTABLE = new Set(["DIAGNOSING", "AWAITING_QUOTE_DECISION"]);

export function ServiceRequestItems({ request }: { request: Pick<AdminAfterSalesRequest, "id" | "type" | "items"> }) { return <div>{request.items.map((item) => <section key={item.id}><h2>{item.deviceLabel}</h2><ServiceRequestActions requestId={request.id} item={item} />{request.type === "TECHNICAL_SUPPORT" && QUOTABLE.has(item.status) && <ServiceQuoteEditor requestId={request.id} itemId={item.id} expectedVersion={item.version} deviceLabel={item.deviceLabel} />}{request.type === "WARRANTY" && item.coverageAtCreation === "REQUIRES_VERIFICATION" && <WarrantyVerificationForm requestId={request.id} itemId={item.id} expectedVersion={item.version} current={item.warrantyVerification ?? null} />}<ServiceAttachmentPanel requestId={request.id} itemId={item.id} /></section>)}</div>; }
