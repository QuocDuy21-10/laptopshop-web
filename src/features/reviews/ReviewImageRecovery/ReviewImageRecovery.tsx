import { useId } from "react";
import type { RecoverableImageSync } from "../pending-image-sync";
import styles from "./ReviewImageRecovery.module.scss";

type Props = {
  pending: RecoverableImageSync;
  filesByClientId: ReadonlyMap<string, File>;
  invalidClientIds: readonly string[];
  disabled?: boolean;
  onReselect: (clientId: string, file: File) => void;
};
export function ReviewImageRecovery({
  pending,
  filesByClientId,
  invalidClientIds,
  disabled,
  onReselect,
}: Props) {
  const id = useId();
  const allItems: ReadonlyArray<RecoverableImageSync["items"][number]> = pending.items;
  const items = allItems.filter(
    (item): item is Extract<RecoverableImageSync["items"][number], { kind: "new" }> =>
      item.kind === "new",
  );
  const missing = items.filter(
    (item) => !filesByClientId.has(item.clientId) || invalidClientIds.includes(item.clientId),
  ).length;
  return (
    <fieldset className={styles.recovery} disabled={disabled}>
      <legend>Gửi tiếp ảnh đang chờ</legend>
      <p>Đánh giá đã lưu; cần chọn lại ảnh gốc để gửi tiếp.</p>
      <p role="status">
        Còn thiếu {missing}/{items.length} ảnh gốc.
      </p>
      {items.map((item, index) => (
        <div className={styles.item} key={item.clientId}>
          <label htmlFor={`${id}-${item.clientId}`}>
            Chọn lại ảnh {index + 1}: {item.fileName}
          </label>
          <input
            id={`${id}-${item.clientId}`}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            aria-describedby={`${id}-${item.clientId}-help`}
            onChange={(event) => {
              const file = event.currentTarget.files?.[0];
              if (file) onReselect(item.clientId, file);
              event.currentTarget.value = "";
            }}
          />
          <p id={`${id}-${item.clientId}-help`}>
            Ảnh gốc, cùng định dạng và dung lượng {item.fileSize} byte.
          </p>
          {filesByClientId.has(item.clientId) && !invalidClientIds.includes(item.clientId) ? (
            <p>Đã chọn ảnh để xác minh.</p>
          ) : null}
          {invalidClientIds.includes(item.clientId) ? (
            <p role="alert">Ảnh không khớp file gốc. Hãy chọn lại đúng ảnh.</p>
          ) : null}
        </div>
      ))}
    </fieldset>
  );
}
