"use client";

import Link from "next/link";
import { buttonClassName } from "@/components/ui/Button/Button";
import type { AfterSalesDevice } from "../types";
import { AFTER_SALES_TYPE_LABEL } from "../labels";
import styles from "./WarrantyCard.module.scss";

export function WarrantyCard({ device }: { device: AfterSalesDevice }) {
  const expired = device.coverage === "OUT_OF_WARRANTY" || device.coverage === "NO_WARRANTY";
  return (
    <article className={styles.card}>
      <div>
        <h2>{device.product.name}</h2>
        <p>Đơn hàng #{device.orderId} · {device.quantity} thiết bị</p>
        <p className={styles.coverage}>{expired ? "Đã hết bảo hành" : device.coverage === "REQUIRES_VERIFICATION" ? "Cần xác minh quyền lợi" : "Còn hạn bảo hành"}</p>
      </div>
      <div className={styles.actions}>
        {device.allowedRequestTypes.includes("WARRANTY") && <Link className={buttonClassName({ size: "sm" })} href={`/account/after-sales/new?type=WARRANTY&orderDetailId=${device.orderDetailId}`}>{AFTER_SALES_TYPE_LABEL.WARRANTY}</Link>}
        {expired && <Link className={buttonClassName({ variant: "secondary", size: "sm" })} href={`/account/after-sales/new?type=TECHNICAL_SUPPORT&orderDetailId=${device.orderDetailId}`}>Hỗ trợ ngoài bảo hành</Link>}
      </div>
    </article>
  );
}
