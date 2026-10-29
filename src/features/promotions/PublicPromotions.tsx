import Link from "next/link";
import { buttonClassName } from "@/components/ui/Button/Button";
import { Price } from "@/components/ui/Price/Price";
import { formatDate } from "@/lib/format";
import { CopyCodeButton } from "./CopyCodeButton";
import type { PublicPromotion } from "@/lib/api/types";
import styles from "./PublicPromotions.module.scss";

export function PublicPromotions({ promotions }: { promotions: PublicPromotion[] }) {
  if (promotions.length === 0) return <p className={styles.empty}>Hiện chưa có mã giảm giá công khai.</p>;
  return (
    <div className={styles.list}>
      {promotions.map((promotion) => (
        <article key={promotion.id} className={styles.card}>
          <div>
            <h2>{promotion.name}</h2>
            <p>{promotion.description ?? "Ưu đãi dành cho đơn hàng đủ điều kiện."}</p>
            <p className={styles.meta}>Mã: <strong>{promotion.code}</strong></p>
            <ul className={styles.conditions}>
              {promotion.minOrderValue > 0 && <li>Đơn từ <Price value={promotion.minOrderValue} size="sm" /></li>}
              {promotion.maxDiscount !== null && <li>Giảm tối đa <Price value={promotion.maxDiscount} size="sm" /></li>}
              <li>Áp dụng đến {formatDate(promotion.endsAt)}</li>
            </ul>
            <div className={styles.actions}>
              <CopyCodeButton code={promotion.code} />
              <Link href="/products" className={buttonClassName({ variant: "ghost", size: "sm" })}>Mua sắm ngay</Link>
            </div>
            <p className={styles.hint}>Nhập mã ở bước thanh toán.</p>
          </div>
          <p className={styles.discount}>
            {promotion.discountKind === "PERCENT" ? `${promotion.discountValue}%` : <Price value={promotion.discountValue} size="sm" />} giảm
          </p>
        </article>
      ))}
    </div>
  );
}
