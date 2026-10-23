"use client";
import { Alert, Card, Descriptions, Skeleton } from "antd";
import { errorMessage } from "@/lib/api/errors";
import { useAdminAfterSalesRequest } from "./hooks";
import { ServiceConversation } from "./ServiceConversation";
import { ServiceRequestItems } from "./ServiceRequestItems";
type AdminRequest = { code: string; subject: string; type: string; customer?: { fullName?: string | null; username?: string } | null; assignee?: { fullName?: string | null; username?: string } | null; items: Array<{ id: number; deviceLabel: string; status: string; version: number }>; events: Array<{ id: number; kind: string; body?: string | null }> };
export function ServiceRequestDetail({ id }: { id: number }) { const query = useAdminAfterSalesRequest(id); if (query.isPending) return <Skeleton active />; if (query.isError) return <Alert type="error" message={errorMessage(query.error)} />; const request = query.data.data as unknown as AdminRequest; return <><Card title={`${request.code} · ${request.subject}`}><Descriptions items={[{ key: "type", label: "Loại", children: request.type }, { key: "customer", label: "Khách hàng", children: request.customer?.fullName ?? request.customer?.username }, { key: "assignee", label: "Phụ trách", children: request.assignee?.fullName ?? "Chưa phân công" }]} /></Card><Card title="Thiết bị"><ServiceRequestItems request={{ id, ...request }} /></Card><Card title="Trao đổi"><ServiceConversation events={request.events ?? []} /></Card></>; }
