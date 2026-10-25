import Link from "next/link";
import { Container } from "@/components/layout/Container/Container";
import styles from "./Footer.module.scss";

export function Footer() {
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
              Hệ thống bán lẻ laptop chính hãng. Tra cứu cấu hình minh bạch, so sánh trực quan và
              thanh toán an toàn khi nhận hàng (COD).
            </p>
            <div className={styles.contactBox}>
              <div className={styles.contactItem}>
                <span className={styles.contactLabel}>Hotline tư vấn:</span>
                <strong>1900 6868 (08:00 – 21:00)</strong>
              </div>
              <div className={styles.contactItem}>
                <span className={styles.contactLabel}>Email hỗ trợ:</span>
                <span>support@laptopshop.vn</span>
              </div>
            </div>
          </div>

          {/* CỘT 2: DANH MỤC SẢN PHẨM */}
          <div className={styles.linkCol}>
            <h3 className={styles.colTitle}>Danh mục laptop</h3>
            <ul className={styles.linkList}>
              <li>
                <Link href="/products">Sản phẩm</Link>
              </li>
              <li>
                <Link href="/products?target=GAMING">Laptop Gaming</Link>
              </li>
              <li>
                <Link href="/products?target=SINHVIEN_VANPHONG">Sinh viên – Văn phòng</Link>
              </li>
              <li>
                <Link href="/products?target=THIET_KE_DO_HOA">Thiết kế đồ họa</Link>
              </li>
              <li>
                <Link href="/products?target=MONG_NHE">Cao cấp – Mỏng nhẹ</Link>
              </li>
            </ul>
          </div>

          {/* CỘT 3: TIỆN ÍCH & TÀI KHOẢN */}
          <div className={styles.linkCol}>
            <h3 className={styles.colTitle}>Tiện ích mua sắm</h3>
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

          {/* CỘT 4: CAM KẾT DỊCH VỤ */}
          <div className={styles.linkCol}>
            <h3 className={styles.colTitle}>Chính sách & Bảo hành</h3>
            <ul className={styles.policyList}>
              <li>
                <strong>Bảo hành chính hãng 100%</strong>
                <span>Từ 12 – 24 tháng tại TTBH các hãng toàn quốc</span>
              </li>
              <li>
                <strong>Đổi mới trong 15 ngày</strong>
                <span>Áp dụng nếu phát sinh lỗi phần cứng từ NSX</span>
              </li>
              <li>
                <strong>Đồng kiểm khi nhận hàng</strong>
                <span>Kiểm tra ngoại quan & cấu hình trước khi thanh toán</span>
              </li>
            </ul>
          </div>
        </div>

        <div className={styles.bottomBar}>
          <p className={styles.copyright}>© {currentYear} LaptopShop. Bảo lưu mọi quyền.</p>
          <div className={styles.paymentBadges}>
            <span className={styles.paymentBadge}>Thanh toán COD</span>
            <span className={styles.paymentBadge}>Chuyển khoản QR</span>
            <span className={styles.paymentBadge}>Hóa đơn VAT</span>
          </div>
        </div>
      </Container>
    </footer>
  );
}
