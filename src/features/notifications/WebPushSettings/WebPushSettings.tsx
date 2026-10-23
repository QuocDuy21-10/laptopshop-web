"use client";

import { useState } from "react";
import { Alert } from "@/components/ui/Alert/Alert";
import { Button } from "@/components/ui/Button/Button";
import { errorMessage } from "@/lib/api/errors";
import { subscribeCurrentBrowser, unsubscribeCurrentBrowser } from "../web-push";
import styles from "./WebPushSettings.module.scss";

export function WebPushSettings({
  userId,
  publicKey,
  enabled,
  permission,
  onEnabled,
  onDisabled,
}: {
  userId: number;
  publicKey: string | null;
  enabled: boolean;
  permission: NotificationPermission | "unsupported";
  onEnabled: () => void;
  onDisabled: () => void;
}) {
  const [error, setError] = useState<string | null>(null);
  const unsupported = permission === "unsupported" || permission === "denied";
  const enable = async () => {
    setError(null);
    try {
      if (!publicKey) throw new Error("PUSH_NOT_SUPPORTED");
      await subscribeCurrentBrowser(publicKey);
      onEnabled();
    } catch (reason) {
      setError(errorMessage(reason));
    }
  };
  const disable = async () => {
    setError(null);
    try {
      await unsubscribeCurrentBrowser();
      onDisabled();
    } catch (reason) {
      setError(errorMessage(reason));
    }
  };
  return (
    <div className={styles.panel} data-user-id={userId}>
      {error && <Alert tone="error" title={error} />}
      {unsupported && (
        <p className={styles.note}>
          Web Push bị từ chối hoặc không được hỗ trợ. Hãy kiểm tra cài đặt trình duyệt.
        </p>
      )}
      {enabled ? (
        <Button type="button" variant="secondary" onClick={disable}>
          Tắt Web Push
        </Button>
      ) : (
        <Button type="button" disabled={unsupported} onClick={enable}>
          Bật Web Push
        </Button>
      )}
    </div>
  );
}
