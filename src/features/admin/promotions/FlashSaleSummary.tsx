import styles from "./FlashSaleAdmin.module.scss";

export type FlashSaleSummaryValue = {
  totalQuota: number;
  claimedUnits: number;
  remainingUnits: number;
  releasedUnits: number;
  completedUnits: number;
  totalDiscountAmount: number;
};

export function FlashSaleSummary({ summary }: { summary: FlashSaleSummaryValue }) {
  const money = new Intl.NumberFormat("vi-VN").format(summary.totalDiscountAmount);
  return (
    <section className={styles.panel} aria-label="Tổng quan Flash Sale">
      <h3>Tổng quan Flash Sale</h3>
      <dl className={styles.kpis}>
        <div><dt>Quota tổng</dt><dd>{summary.totalQuota}</dd></div>
        <div><dt>Đã claim</dt><dd>{summary.claimedUnits}</dd></div>
        <div><dt>Còn lại</dt><dd>{summary.remainingUnits}</dd></div>
        <div><dt>Đã release</dt><dd>{summary.releasedUnits}</dd></div>
        <div><dt>Đã hoàn tất</dt><dd>{summary.completedUnits}</dd></div>
        <div><dt>Tổng giảm</dt><dd>{money} ₫</dd></div>
      </dl>
    </section>
  );
}
