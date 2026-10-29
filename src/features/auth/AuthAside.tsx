import { ClipboardList, Heart, ShieldCheck } from "lucide-react";
import styles from "./AuthAside.module.scss";

const BENEFITS = [
  { icon: ClipboardList, text: "Theo dõi đơn hàng và lịch sử mua sắm" },
  { icon: Heart, text: "Giỏ hàng và danh sách yêu thích đồng bộ theo tài khoản" },
  { icon: ShieldCheck, text: "Gửi và theo dõi yêu cầu bảo hành, hậu mãi" },
];

export function AuthAside() {
  return (
    <aside className={styles.aside}>
      <p className={styles.heading}>Chào mừng đến LaptopShop</p>
      <ul className={styles.list}>
        {BENEFITS.map(({ icon: Icon, text }) => (
          <li key={text} className={styles.item}>
            <Icon size={20} aria-hidden="true" />
            {text}
          </li>
        ))}
      </ul>
    </aside>
  );
}
