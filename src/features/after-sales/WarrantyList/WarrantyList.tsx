"use client";

import { useState } from "react";
import { Alert } from "@/components/ui/Alert/Alert";
import { Button } from "@/components/ui/Button/Button";
import { Skeleton } from "@/components/ui/Skeleton/Skeleton";
import { errorMessage } from "@/lib/api/errors";
import { useAfterSalesDevices } from "../hooks";
import { WarrantyCard } from "../WarrantyCard/WarrantyCard";
import styles from "./WarrantyList.module.scss";

export function WarrantyList({ userId }: { userId: number }) {
  const [page, setPage] = useState(1);
  const devices = useAfterSalesDevices(userId, "TECHNICAL_SUPPORT", page);
  if (devices.isPending) return <Skeleton className={styles.skeleton} />;
  if (devices.isError) return <Alert tone="error" title={errorMessage(devices.error)} />;
  if (!devices.data.data.length) return <p className={styles.empty}>Chưa có thiết bị đủ điều kiện hậu mãi.</p>;
  return <><div className={styles.list}>{devices.data.data.map((device) => <WarrantyCard key={device.orderDetailId} device={device} />)}</div><div className={styles.pagination}><Button size="sm" variant="secondary" disabled={page <= 1} onClick={() => setPage((value) => value - 1)}>Trang trước</Button><span>Trang {devices.data.meta.page} / {devices.data.meta.totalPages}</span><Button size="sm" variant="secondary" disabled={page >= devices.data.meta.totalPages} onClick={() => setPage((value) => value + 1)}>Trang sau</Button></div></>;
}
