"use client";
import { Alert, Card, Descriptions, Skeleton } from "antd";
import { errorMessage } from "@/lib/api/errors";
import { useAdminAfterSalesRequest } from "./hooks";
import { ServiceConversation } from "./ServiceConversation";
import { ServiceRequestItems } from "./ServiceRequestItems";
import { ServiceRequestAssignment } from "./ServiceRequestAssignment";
import type { AdminAfterSalesRequest } from "@/lib/api/types";
export function ServiceRequestDetail({ id }: { id: number }) { const query = useAdminAfterSalesRequest(id); if (query.isPending) return <Skeleton active />; if (query.isError) return <Alert type="error" message={errorMessage(query.error)} />; const request: AdminAfterSalesRequest = query.data.data; return <><Card title={`${request.code} · ${request.subject}`}><Descriptions items={[{ key: "type", label: "Loại", children: request.type }, { key: "customer", label: "Khách hàng", children: request.customer?.fullName ?? request.customer?.username }, { key: "assignee", label: "Phụ trách", children: <ServiceRequestAssignment requestId={request.id} expectedVersion={request.version ?? 1} assignedToId={request.assignee?.id} /> }]} /></Card><Card title="Thiết bị"><ServiceRequestItems request={request} /></Card><Card title="Trao đổi"><ServiceConversation events={request.events ?? []} /></Card></>; }
