"use client";

import { useState } from "react";
import { Alert } from "@/components/ui/Alert/Alert";
import { Button } from "@/components/ui/Button/Button";
import { Dialog } from "@/components/ui/Dialog/Dialog";
import { TextField } from "@/components/ui/TextField/TextField";
import { errorMessage } from "@/lib/api/errors";
import { useConfirmEmailOtp, useRequestEmailOtp } from "../hooks";
import styles from "./EmailVerificationDialog.module.scss";

export function EmailVerificationDialog({
  userId,
  open,
  onOpenChange,
  onVerified,
}: {
  userId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onVerified: () => void;
}) {
  const [code, setCode] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const request = useRequestEmailOtp();
  const confirm = useConfirmEmailOtp(userId);
  const send = async () => {
    setMessage(null);
    try {
      await request.mutateAsync();
      setMessage("Yêu cầu gửi mã đã được tiếp nhận. Hãy kiểm tra email.");
    } catch (error) {
      setMessage(errorMessage(error));
    }
  };
  const verify = async () => {
    if (!/^\d{6}$/.test(code)) return;
    setMessage(null);
    try {
      await confirm.mutateAsync(code);
      onVerified();
      onOpenChange(false);
    } catch (error) {
      setMessage(errorMessage(error));
    }
  };
  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title="Xác minh email"
      description="Nhập mã 6 chữ số đã được gửi tới email tài khoản."
    >
      <div className={styles.form}>
        {message && (
          <Alert tone={message.includes("tiếp nhận") ? "info" : "error"} title={message} />
        )}
        <TextField
          label="Mã xác minh"
          value={code}
          inputMode="numeric"
          maxLength={6}
          onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
        />
        <div className={styles.actions}>
          <Button type="button" onClick={send} loading={request.isPending}>
            Gửi mã
          </Button>
          <Button
            type="button"
            disabled={code.length !== 6}
            loading={confirm.isPending}
            onClick={verify}
          >
            Xác minh
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
