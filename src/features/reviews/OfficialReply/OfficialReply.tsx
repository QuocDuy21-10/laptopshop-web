import type { PublicOfficialReply } from "@/lib/api/types";
import { formatDate } from "@/lib/format";
import styles from "./OfficialReply.module.scss";

export function OfficialReply({ reply }: { reply: PublicOfficialReply | null }) {
  if (!reply) return null;
  return <aside className={styles.reply} aria-label="Phản hồi từ LaptopShop">
    <p className={styles.label}>Phản hồi từ LaptopShop</p>
    <p className={styles.content}>{reply.content}</p>
    <time className={styles.time} dateTime={reply.updatedAt}>Cập nhật {formatDate(reply.updatedAt)}</time>
  </aside>;
}
