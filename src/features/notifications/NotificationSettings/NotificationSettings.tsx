"use client";

import { useState } from "react";
import { Alert } from "@/components/ui/Alert/Alert";
import { useMe } from "@/features/account/useMe";
import { errorMessage } from "@/lib/api/errors";
import {
  useNotificationPreferences,
  useUpdateNotificationPreferences,
  useWebPushConfig,
} from "../hooks";
import { WebPushSettings } from "../WebPushSettings/WebPushSettings";
import { EmailVerificationDialog } from "../EmailVerificationDialog/EmailVerificationDialog";
import styles from "./NotificationSettings.module.scss";

export function NotificationSettings() {
  const me = useMe();
  const preferences = useNotificationPreferences(me.data?.id);
  const pushConfig = useWebPushConfig(me.data?.id);
  const update = useUpdateNotificationPreferences(me.data?.id);
  const [otpOpen, setOtpOpen] = useState(false);
  if (me.isPending || preferences.isPending || pushConfig.isPending)
    return <p>Đang tải cài đặt thông báo…</p>;
  if (
    me.isError ||
    preferences.isError ||
    pushConfig.isError ||
    !preferences.data ||
    !pushConfig.data
  )
    return (
      <Alert tone="error" title={errorMessage(me.error ?? preferences.error ?? pushConfig.error)} />
    );
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
        Chọn kênh nhận thông báo. In-App luôn bật để không bỏ lỡ trạng thái dịch vụ.
      </p>
      {update.error && <Alert tone="error" title={errorMessage(update.error)} />}
      <div className={styles.row}>
        <span>
          <strong>In-App</strong>
          <small>Luôn bật</small>
        </span>
        <input type="checkbox" checked disabled aria-label="In-App luôn bật" />
      </div>
      <div className={styles.row}>
        <span><strong>Cập nhật hậu mãi qua Email</strong><small>Không ảnh hưởng Price Alert</small></span>
        <input type="checkbox" aria-label="Email cập nhật hậu mãi" checked={value.afterSalesEmailEnabled ?? true} disabled={!value.emailEnabled} onChange={(event) => update.mutate({ afterSalesEmailEnabled: event.target.checked })} />
      </div>
      <div className={styles.row}>
        <span><strong>Cập nhật hậu mãi qua Web Push</strong><small>Không ảnh hưởng Price Alert</small></span>
        <input type="checkbox" aria-label="Web Push cập nhật hậu mãi" checked={value.afterSalesWebPushEnabled ?? true} disabled={!value.webPushEnabled} onChange={(event) => update.mutate({ afterSalesWebPushEnabled: event.target.checked })} />
      </div>
      <div className={styles.row}>
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
      </div>
      <div className={styles.row}>
        <span>
          <strong>Web Push</strong>
          <small>Quản lý ở bước đăng ký thiết bị</small>
        </span>
        <WebPushSettings
          userId={me.data!.id}
          publicKey={pushConfig.data.publicKey}
          enabled={value.webPushEnabled}
          permission={
            typeof window === "undefined"
              ? "unsupported"
              : "Notification" in window
                ? Notification.permission
                : "unsupported"
          }
          onEnabled={() => update.mutate({ webPushEnabled: true })}
          onDisabled={() => update.mutate({ webPushEnabled: false })}
        />
      </div>
      <EmailVerificationDialog
        userId={me.data!.id}
        open={otpOpen}
        onOpenChange={setOtpOpen}
        onVerified={() => update.mutate({ emailEnabled: true })}
      />
    </section>
  );
}
