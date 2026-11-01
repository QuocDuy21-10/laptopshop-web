import { CreditCard, Mail, Phone, Receipt, type LucideIcon } from "lucide-react";
import { PAYMENT_LABEL } from "@/features/store-info/labels";
import type { StoreInfo } from "@/lib/api/types";
import styles from "./StoreCommitments.module.scss";

type Item = { key: string; icon: LucideIcon; title: string; detail?: string };

// only facts the store has configured in /store-info; nothing else is promised here
export function StoreCommitments({ info }: { info: StoreInfo | null }) {
  if (!info) return null;
  const payments = info.paymentMethods.flatMap((code) => (PAYMENT_LABEL[code] ? [PAYMENT_LABEL[code]] : []));
  const items: Item[] = [
    ...(info.hotline ? [{ key: "hotline", icon: Phone, title: info.hotline, detail: info.supportHours ?? undefined }] : []),
    ...(info.supportEmail ? [{ key: "email", icon: Mail, title: info.supportEmail, detail: "Email hỗ trợ" }] : []),
    ...(info.vatInvoice ? [{ key: "vat", icon: Receipt, title: "Có hóa đơn VAT" }] : []),
    ...(payments.length ? [{ key: "payments", icon: CreditCard, title: payments.join(", ") }] : []),
  ];
  if (items.length === 0) return null;
  return (
    <section aria-label="Thông tin mua sắm" className={styles.strip}>
      <ul role="list" className={styles.list}>
        {items.map(({ key, icon: Icon, title, detail }) => (
          <li key={key} className={styles.item}>
            <span className={styles.icon} aria-hidden="true">
              <Icon size={20} />
            </span>
            <span className={styles.text}>
              <span className={styles.title}>{title}</span>
              {detail && <span className={styles.detail}>{detail}</span>}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
