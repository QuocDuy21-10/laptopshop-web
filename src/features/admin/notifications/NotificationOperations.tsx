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
            {worker.workerName} · {worker.status} · {worker.isStale ? "STALE" : "FRESH"} ·{" "}
            {new Date(worker.lastSeenAt).toLocaleString("vi-VN")}
          </p>
        ))}
      </Card>
      <Card title="Price Alert sweep" style={{ marginTop: 16 }}>
        {query.data.priceAlertSweep ? (
          <div>
            <p>Checkpoint product: {query.data.priceAlertSweep.checkpointProductId}</p>
            <p>Last succeeded: {query.data.priceAlertSweep.lastSucceededAt ? new Date(query.data.priceAlertSweep.lastSucceededAt).toLocaleString("vi-VN") : "Chưa có"}</p>
            <p>Duration: {query.data.priceAlertSweep.lastDurationMs ?? "—"} ms</p>
            <p>Consecutive failures: {query.data.priceAlertSweep.consecutiveFailures}</p>
            {query.data.priceAlertSweep.lastStats && (
              <>
                <p>Products scanned: {query.data.priceAlertSweep.lastStats.productsScanned}</p>
                <p>Items evaluated: {query.data.priceAlertSweep.lastStats.itemsEvaluated}</p>
                <p>Notifications created: {query.data.priceAlertSweep.lastStats.notificationsCreated}</p>
                <p>Duplicates skipped: {query.data.priceAlertSweep.lastStats.duplicatesSkipped}</p>
                <p>Invalid states skipped: {query.data.priceAlertSweep.lastStats.invalidStatesSkipped}</p>
                <p>Errors: {query.data.priceAlertSweep.lastStats.errors}</p>
              </>
            )}
            {query.data.priceAlertSweep.lastErrorCode && <p>Last error: {query.data.priceAlertSweep.lastErrorCode}</p>}
          </div>
        ) : (
          <p>Chưa có checkpoint Price Alert.</p>
        )}
      </Card>
    </div>
  );
}
