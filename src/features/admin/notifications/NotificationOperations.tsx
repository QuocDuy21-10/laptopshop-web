"use client";

import { Alert, Card, Col, Row, Skeleton, Statistic } from "antd";
import { errorMessage } from "@/lib/api/errors";
import { useNotificationOperations } from "./hooks";

export function NotificationOperations() {
  const query = useNotificationOperations();
  if (query.isPending) return <Skeleton active />;
  if (!query.data) return <Alert type="error" showIcon title={errorMessage(query.error)} />;
  return (
    <div>
      <div className="admin-head">
        <h1>Notification Operations</h1>
      </div>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic title="Alert đang hoạt động" value={query.data.activeAlerts} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic title="In-App Notification" value={query.data.notifications} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic title="Delivery DEAD" value={query.data.deadDeliveries} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic title="Outbox pending" value={query.data.pendingOutbox} />
          </Card>
        </Col>
      </Row>
      <Card title="Worker heartbeat" style={{ marginTop: 16 }}>
        {query.data.workers.map((worker) => (
          <p key={worker.workerName + worker.instanceId}>
            {worker.workerName} · {worker.status} ·{" "}
            {new Date(worker.lastSeenAt).toLocaleString("vi-VN")}
          </p>
        ))}
      </Card>
    </div>
  );
}
