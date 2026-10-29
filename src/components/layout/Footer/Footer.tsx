import Link from "next/link";
import { Container } from "@/components/layout/Container/Container";
import { TARGET_LABEL } from "@/features/products/labels";
import { getStoreInfo } from "@/features/store-info/server";
import styles from "./Footer.module.scss";

const PAYMENT_LABEL: Record<string, string> = { COD: "Thanh toán COD", BANK_TRANSFER: "Chuyển khoản QR" };

export async function Footer() {
  const info = await getStoreInfo();
  const hotline = info?.hotline ? [info.hotline, info.supportHours].filter(Boolean).join(" · ") : null;
  const badges = [
    ...(info?.paymentMethods ?? []).flatMap((code) => (PAYMENT_LABEL[code] ? [PAYMENT_LABEL[code]] : [])),
    ...(info?.vatInvoice ? ["Hóa đơn VAT"] : []),
  ];
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <Container className={styles.container}>
        <div className={styles.grid}>
          {/* CỘT 1: BRAND & CONTACT */}
          <div className={styles.brandCol}>
            <Link href="/" className={styles.brand}>
              <span className={styles.brandIcon} aria-hidden>
                <svg
                  viewBox="0 0 24 24"
                  width="16"
                  height="16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="3" y="4" width="18" height="12" rx="2" ry="2" />
                  <line x1="2" y1="20" x2="22" y2="20" />
                </svg>
              </span>
              <span>LaptopShop</span>
            </Link>
            <p className={styles.tagline}>
              Hệ thống bán lẻ laptop. Tra cứu cấu hình minh bạch và so sánh trực quan.
            </p>
            {(hotline || info?.supportEmail) && (
              <div className={styles.contactBox}>
                {hotline && (
                  <div className={styles.contactItem}>
                    <span className={styles.contactLabel}>Hotline tư vấn:</span>
                    <strong>{hotline}</strong>
                  </div>
                )}
                {info?.supportEmail && (
                  <div className={styles.contactItem}>
                    <span className={styles.contactLabel}>Email hỗ trợ:</span>
                    <span>{info.supportEmail}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* CỘT 2: DANH MỤC SẢN PHẨM */}
          <div className={styles.linkCol}>
            <h2 className={styles.colTitle}>Danh mục laptop</h2>
            <ul className={styles.linkList}>
              <li>
                <Link href="/products">Sản phẩm</Link>
              </li>
              {Object.entries(TARGET_LABEL).map(([value, name]) => (
                <li key={value}>
                  <Link href={`/products?target=${value}`}>{name}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* CỘT 3: TIỆN ÍCH & TÀI KHOẢN */}
          <div className={styles.linkCol}>
            <h2 className={styles.colTitle}>Tiện ích mua sắm</h2>
            <ul className={styles.linkList}>
              <li>
                <Link href="/advisor">Tư vấn chọn laptop</Link>
              </li>
              <li>
                <Link href="/compare">So sánh cấu hình</Link>
              </li>
              <li>
                <Link href="/account/orders">Đơn hàng của tôi</Link>
              </li>
              <li>
                <Link href="/cart">Giỏ hàng</Link>
              </li>
              <li>
                <Link href="/account">Tài khoản cá nhân</Link>
              </li>
            </ul>
          </div>
        </div>

        <div className={styles.bottomBar}>
          <p className={styles.copyright}>© {currentYear} LaptopShop. Bảo lưu mọi quyền.</p>
          {badges.length > 0 && (
            <div className={styles.paymentBadges}>
              {badges.map((label) => (
                <span key={label} className={styles.paymentBadge}>
                  {label}
                </span>
              ))}
            </div>
          )}
        </div>
      </Container>
    </footer>
  );
}
