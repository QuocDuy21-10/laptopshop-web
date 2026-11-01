"use client";

import { Alert } from "@/components/ui/Alert/Alert";
import { Button } from "@/components/ui/Button/Button";
import { errorMessage } from "@/lib/api/errors";
import { useConfirmNewsletter, useUnsubscribeNewsletter } from "../hooks";
import styles from "./NewsletterTokenAction.module.scss";

const COPY = {
  confirm: {
    prompt: "Bấm nút bên dưới để hoàn tất đăng ký nhận ưu đãi từ LaptopShop.",
    button: "Xác nhận đăng ký",
    done: "Đã xác nhận đăng ký. Cảm ơn bạn!",
  },
  unsubscribe: {
    prompt: "Bấm nút bên dưới nếu bạn không muốn nhận ưu đãi từ LaptopShop nữa.",
    button: "Hủy đăng ký",
    done: "Đã hủy đăng ký. Bạn sẽ không nhận thêm email ưu đãi.",
  },
} as const;

// The API is only called after a click: a mail scanner that opens the link must not confirm or cancel on the reader's behalf.
export function NewsletterTokenAction({ action, token }: { action: "confirm" | "unsubscribe"; token?: string }) {
  const confirm = useConfirmNewsletter();
  const unsubscribe = useUnsubscribeNewsletter();
  const mutation = action === "confirm" ? confirm : unsubscribe;
  const copy = COPY[action];

  if (!token) {
    return (
      <Alert tone="error" title="Liên kết không hợp lệ hoặc đã hết hạn.">
        Hãy mở lại liên kết trong email, hoặc đăng ký lại ở trang chủ.
      </Alert>
    );
  }
  if (mutation.isSuccess) return <Alert tone="success" title={copy.done} />;
  return (
    <div className={styles.box}>
      <p className={styles.text}>{copy.prompt}</p>
      {mutation.isError && <Alert tone="error" title={errorMessage(mutation.error)} />}
      <Button loading={mutation.isPending} onClick={() => mutation.mutate({ token })}>
        {copy.button}
      </Button>
    </div>
  );
}
