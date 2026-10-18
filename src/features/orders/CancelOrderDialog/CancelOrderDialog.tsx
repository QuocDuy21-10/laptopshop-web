"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button/Button";
import { Dialog } from "@/components/ui/Dialog/Dialog";
import { errorMessage } from "@/lib/api/errors";
import { useCancelOrder } from "../hooks";
import styles from "./CancelOrderDialog.module.scss";

export function CancelOrderDialog({ orderId }: { orderId: number }) {
  const [open, setOpen] = useState(false);
  const cancel = useCancelOrder(orderId);

  const confirm = () =>
    cancel.mutate(undefined, {
      onSuccess: () => toast.success("Đã huỷ đơn hàng"),
      onError: (e) => toast.error(errorMessage(e)),
      onSettled: () => setOpen(false),
    });

  return (
    <Dialog
      open={open}
      onOpenChange={setOpen}
      title="Huỷ đơn hàng?"
      description="Đơn sẽ bị huỷ và sản phẩm được trả lại kho. Thao tác này không thể hoàn tác."
      trigger={<Button variant="danger">Huỷ đơn</Button>}
    >
      <div className={styles.actions}>
        <Button variant="ghost" onClick={() => setOpen(false)} disabled={cancel.isPending}>
          Giữ đơn
        </Button>
        <Button variant="danger" onClick={confirm} loading={cancel.isPending}>
          Xác nhận huỷ
        </Button>
      </div>
    </Dialog>
  );
}
