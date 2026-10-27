import { Price } from "@/components/ui/Price/Price";
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
          </div>
          <p className={styles.discount}>
            {promotion.discountKind === "PERCENT" ? `${promotion.discountValue}%` : <Price value={promotion.discountValue} size="sm" />} giảm
          </p>
        </article>
      ))}
    </div>
  );
}
