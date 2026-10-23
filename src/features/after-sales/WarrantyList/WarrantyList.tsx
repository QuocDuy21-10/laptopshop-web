"use client";

import { Alert } from "@/components/ui/Alert/Alert";
import { Skeleton } from "@/components/ui/Skeleton/Skeleton";
import { errorMessage } from "@/lib/api/errors";
import { useAfterSalesDevices } from "../hooks";
import { WarrantyCard } from "../WarrantyCard/WarrantyCard";
import styles from "./WarrantyList.module.scss";

export function WarrantyList({ userId }: { userId: number }) {
  const devices = useAfterSalesDevices(userId, "TECHNICAL_SUPPORT");
  if (devices.isPending) return <Skeleton className={styles.skeleton} />;
  if (devices.isError) return <Alert tone="error" title={errorMessage(devices.error)} />;
  if (!devices.data.data.length) return <p className={styles.empty}>Chưa có thiết bị đủ điều kiện hậu mãi.</p>;
  return <div className={styles.list}>{devices.data.data.map((device) => <WarrantyCard key={device.orderDetailId} device={device} />)}</div>;
}
