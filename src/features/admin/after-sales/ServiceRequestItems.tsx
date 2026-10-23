"use client";
import { ServiceRequestActions } from "./ServiceRequestActions";
import { ServiceQuoteEditor } from "./ServiceQuoteEditor";
type AdminItem = { id: number; deviceLabel: string; status: string; version: number };
type AdminRequest = { id: number; type: string; items: AdminItem[] };
export function ServiceRequestItems({ request }: { request: AdminRequest }) { return <div>{request.items.map((item) => <section key={item.id}><h2>{item.deviceLabel}</h2><ServiceRequestActions requestId={request.id} item={item} />{request.type === "TECHNICAL_SUPPORT" && <ServiceQuoteEditor requestId={request.id} itemId={item.id} expectedVersion={item.version} deviceLabel={item.deviceLabel} />}</section>)}</div>; }
