import Link from "next/link";
import { Badge } from "@/components/ui/Badge/Badge";
import { PromotionPrice } from "@/features/promotions/PromotionPrice/PromotionPrice";
import { CompareToggle } from "@/features/compare/CompareToggle/CompareToggle";
import { AddToCartButton } from "@/features/products/AddToCart/AddToCartButton";
import { ProductImage } from "@/features/products/ProductImage/ProductImage";
import type { CatalogProduct, Product } from "@/lib/api/types";
import { WishlistToggle } from "@/features/wishlist/WishlistToggle/WishlistToggle";
import styles from "./ProductCard.module.scss";

interface ProductCardProps {
  product: Product | CatalogProduct;
  factoryName?: string;
}

/**
 * Tách chuỗi shortDesc chưa đồng nhất (VD: "i5 1235U/16GB/512GB/15.6\"FHD" hoặc "Intel, Core i5, 11400H")
 * thành các Spec Pills ngắn gọn để người dùng dễ quét mắt so sánh.
 */
function extractSpecPills(shortDesc?: string | null): string[] {
  if (!shortDesc) return [];
  const rawParts = shortDesc
    .split(/[/,|•]+/)
    .map((s) => s.trim())
    .filter(Boolean);

  // Nếu chuỗi tách bằng dấu phẩy kiểu "Intel, Core i5, 11400H", gộp "Intel Core i5" cho gọn
  if (rawParts.length >= 3 && rawParts[0].toLowerCase() === "intel") {
    return [`${rawParts[0]} ${rawParts[1]}`, ...rawParts.slice(2)].slice(0, 3);
  }

  return rawParts.slice(0, 3);
}

export function ProductCard({ product, factoryName }: ProductCardProps) {
  const id = product.id;
  const href = `/products/${id}`;
  const outOfStock = product.quantity <= 0;
  const factoryLabel = factoryName ?? product.factory;
  const reviewSummary = "reviewSummary" in product ? product.reviewSummary : undefined;
  const reviewCount = reviewSummary?.totalReviews ?? 0;
  const averageRating = reviewSummary?.averageRating ?? 0;
  const specPills = extractSpecPills(product.shortDesc);

  return (
    <article className={styles.card}>
      <div className={styles.mediaWrap}>
        <div className={styles.badgeOverlay}>
          {outOfStock ? (
            <Badge tone="error">Hết hàng</Badge>
          ) : (
            <Badge tone="success">Còn hàng</Badge>
          )}
        </div>

        <Link href={href} className={styles.imageLink} aria-label={`Xem chi tiết ${product.name}`}>
          <ProductImage
            src={product.image}
            alt={product.name}
            sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
          />
        </Link>
        {/* sibling of the link: a button nested in <a> also triggers the link navigation */}
        <div className={styles.wishlistOverlay}>
          <WishlistToggle productId={product.id} productName={product.name} />
        </div>
      </div>

      <div className={styles.body}>
        <div className={styles.metaRow}>
          {factoryLabel ? <span className={styles.factory}>{factoryLabel}</span> : <span />}

          <div
            className={styles.rating}
            aria-label={
              reviewCount > 0
                ? `Đánh giá ${averageRating.toFixed(1)} sao, ${reviewCount} đánh giá`
                : "Chưa có đánh giá"
            }
          >
            {reviewCount > 0 ? (
              <>
                <span className={styles.ratingValue}>★ {averageRating.toFixed(1)} ({reviewCount})</span>
              </>
            ) : (
              <span className={styles.noRating}>Chưa có đánh giá</span>
            )}
          </div>
        </div>

        <h3 className={styles.name}>
          <Link href={href} className={styles.nameLink}>
            {product.name}
          </Link>
        </h3>

        {specPills.length > 0 ? (
          <ul className={styles.specList} aria-label="Thông số tóm tắt">
            {specPills.map((spec, idx) => (
              <li key={idx} className={styles.specPill}>
                {spec}
              </li>
            ))}
          </ul>
        ) : (
          <div className={styles.specListPlaceholder} aria-hidden />
        )}

        <div className={styles.footer}>
          <div className={styles.priceRow}>
            <PromotionPrice product={product} />
            <CompareToggle product={product} />
          </div>

          <div className={styles.actionRow}>
            <AddToCartButton productId={id} productName={product.name} disabled={outOfStock} />
          </div>
        </div>
      </div>
    </article>
  );
}
