"use client";

import { useState } from "react";
import { Alert } from "@/components/ui/Alert/Alert";
import { useMe } from "@/features/account/useMe";
import { errorMessage } from "@/lib/api/errors";
import { useNotificationPreferences, useUpdateNotificationPreferences } from "../hooks";
import { EmailVerificationDialog } from "../EmailVerificationDialog/EmailVerificationDialog";
import styles from "./NotificationSettings.module.scss";

export function NotificationSettings() {
  const me = useMe();
  const preferences = useNotificationPreferences(me.data?.id);
  const update = useUpdateNotificationPreferences(me.data?.id);
  const [otpOpen, setOtpOpen] = useState(false);
  if (me.isPending || preferences.isPending) return <p>Đang tải cài đặt thông báo…</p>;
  if (me.isError || preferences.isError || !preferences.data)
    return <Alert tone="error" title={errorMessage(me.error ?? preferences.error)} />;
  const value = preferences.data;
  const toggleEmail = () => {
    if (value.emailEnabled) {
      update.mutate({ emailEnabled: false });
      return;
    }
    if (!me.data?.emailVerifiedAt) {
      setOtpOpen(true);
      return;
    }
    update.mutate({ emailEnabled: true });
  };
  return (
    <section className={styles.panel} aria-labelledby="notification-settings-title">
      <h1 id="notification-settings-title">Cài đặt thông báo</h1>
      <p className={styles.description}>
        Chọn kênh nhận Price Alert. In-App luôn bật để không bỏ lỡ trạng thái giá.
      </p>
      {update.error && <Alert tone="error" title={errorMessage(update.error)} />}
      <label className={styles.row}>
        <span>
          <strong>In-App</strong>
          <small>Luôn bật</small>
        </span>
        <input type="checkbox" checked disabled aria-label="In-App luôn bật" />
      </label>
      <label className={styles.row}>
        <span>
          <strong>Email</strong>
          <small>{me.data?.emailVerifiedAt ? "Email đã xác minh" : "Cần xác minh OTP"}</small>
        </span>
        <input
          type="checkbox"
          checked={value.emailEnabled}
          onChange={toggleEmail}
          aria-label="Email"
        />
      </label>
      <label className={styles.row}>
        <span>
          <strong>Web Push</strong>
          <small>Quản lý ở bước đăng ký thiết bị</small>
        </span>
        <input
          type="checkbox"
          checked={value.webPushEnabled}
          onChange={(event) => update.mutate({ webPushEnabled: event.target.checked })}
          aria-label="Web Push"
        />
      </label>
      <EmailVerificationDialog
        userId={me.data!.id}
        open={otpOpen}
        onOpenChange={setOtpOpen}
        onVerified={() => update.mutate({ emailEnabled: true })}
      />
    </section>
  );
}
