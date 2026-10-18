"use client";

import { Alert } from "@/components/ui/Alert/Alert";
import { Skeleton } from "@/components/ui/Skeleton/Skeleton";
import { errorMessage } from "@/lib/api/errors";
import { ProfileForm } from "./ProfileForm/ProfileForm";
import styles from "./ProfileForm/ProfileForm.module.scss";
import { useMe } from "./useMe";

export function AccountProfile() {
  const me = useMe();
  if (me.isPending) return <Skeleton className={styles.form} />;
  if (me.isError) return <Alert tone="error" title={errorMessage(me.error)} />;
  // null means the session ended; the expired-session handler is already redirecting to login
  if (!me.data) return <Skeleton className={styles.form} />;
  return <ProfileForm me={me.data} />;
}
