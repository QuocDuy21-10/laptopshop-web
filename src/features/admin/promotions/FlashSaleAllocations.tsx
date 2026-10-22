import type { FlashSaleAllocation, PageMeta } from "@/lib/api/types";
import styles from "./FlashSaleAdmin.module.scss";

export function FlashSaleAllocations({
  allocations,
  meta,
  onPage,
}: {
  allocations: FlashSaleAllocation[];
  meta: PageMeta;
  onPage: (page: number) => void;
}) {
  return (
    <section className={styles.panel} aria-label="Lịch sử allocation Flash Sale">
      <h3>Lịch sử allocation</h3>
      <div className={styles.tableWrap}>
        <table>
          <thead><tr><th>Sản phẩm</th><th>User</th><th>Đơn</th><th>Units</th><th>Trạng thái</th><th>Lý do</th></tr></thead>
          <tbody>{allocations.map((allocation) => <tr key={allocation.id}>
            <td>{allocation.product.name}</td><td>{allocation.user.username}</td><td>#{allocation.orderId}</td>
            <td>{allocation.quantity}</td><td>{allocation.status}</td><td>{allocation.releaseReason ?? "—"}</td>
          </tr>)}</tbody>
        </table>
      </div>
      <div className={styles.pagination}>
        <button type="button" onClick={() => onPage(meta.page - 1)} disabled={meta.page <= 1}>Trang trước</button>
        <span>Trang {meta.page} / {Math.max(1, meta.totalPages)}</span>
        <button type="button" onClick={() => onPage(meta.page + 1)} disabled={meta.page >= meta.totalPages}>Trang sau</button>
      </div>
    </section>
  );
}
