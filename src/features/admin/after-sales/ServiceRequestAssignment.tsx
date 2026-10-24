"use client";

import { Select } from "antd";
import { useAdminAfterSalesAssignees, useAssignAfterSalesRequest } from "./hooks";

export function ServiceRequestAssignment({ requestId, expectedVersion, assignedToId }: { requestId: number; expectedVersion: number; assignedToId?: number | null }) {
  const assignees = useAdminAfterSalesAssignees();
  const assign = useAssignAfterSalesRequest(requestId);
  return <Select aria-label="Phân công nhân viên" loading={assignees.isPending} value={assignedToId ?? undefined} placeholder="Chưa phân công" allowClear options={(assignees.data?.data ?? []).map((person) => ({ value: person.id, label: person.name }))} onChange={(value) => assign.mutate({ assignedToId: value ?? null, expectedVersion })} />;
}
