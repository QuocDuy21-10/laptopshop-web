"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { UserRound } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Alert } from "@/components/ui/Alert/Alert";
import { Button } from "@/components/ui/Button/Button";
import { TextField } from "@/components/ui/TextField/TextField";
import { errorMessage } from "@/lib/api/errors";
import type { Me } from "@/lib/api/types";
import { applyFieldErrors } from "@/lib/forms";
import { AVATAR_TYPES, MAX_AVATAR_BYTES, profileSchema, type ProfileInput } from "../schema";
import { useUpdateMe } from "../useUpdateMe";
import styles from "./ProfileForm.module.scss";

export function ProfileForm({ me }: { me: Me }) {
  const update = useUpdateMe();
  const [avatar, setAvatar] = useState<File | undefined>();
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const { register, handleSubmit, setError, formState } = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    defaultValues: { fullName: me.fullName ?? "", phone: me.phone ?? "", address: me.address ?? "" },
  });

  const pickAvatar = (file: File | undefined) => {
    setAvatar(undefined);
    setAvatarError(null);
    if (!file) return;
    if (!AVATAR_TYPES.includes(file.type)) return setAvatarError("Chỉ chấp nhận ảnh JPEG hoặc PNG");
    if (file.size > MAX_AVATAR_BYTES) return setAvatarError("Ảnh tối đa 3 MB");
    setAvatar(file);
  };

  const onSubmit = handleSubmit(async (values) => {
    if (avatarError) return;
    setFormError(null);
    try {
      await update.mutateAsync({ values, avatar });
      toast.success("Đã lưu thay đổi");
    } catch (e) {
      if (!applyFieldErrors(e, setError)) setFormError(errorMessage(e));
    }
  });

  return (
    <form className={styles.form} onSubmit={onSubmit} noValidate>
      {formError && <Alert tone="error" title={formError} />}
      <div className={styles.avatarRow}>
        <div className={styles.avatar}>
          {me.avatar ? (
            <Image src={me.avatar} alt="" fill sizes="72px" unoptimized className={styles.avatarImg} />
          ) : (
            <UserRound size={32} aria-hidden="true" />
          )}
        </div>
        <div className={styles.avatarField}>
          <label htmlFor="avatar" className={styles.label}>
            Ảnh đại diện
          </label>
          <input
            id="avatar"
            type="file"
            accept="image/png,image/jpeg"
            aria-describedby={avatarError ? "avatar-error" : "avatar-hint"}
            onChange={(e) => pickAvatar(e.target.files?.[0])}
          />
          {avatarError ? (
            <p id="avatar-error" className={styles.error} role="alert">
              {avatarError}
            </p>
          ) : (
            <p id="avatar-hint" className={styles.hint}>
              PNG hoặc JPEG, tối đa 3 MB
            </p>
          )}
        </div>
      </div>
      <TextField label="Email" value={me.username} disabled readOnly />
      <TextField label="Họ tên" required autoComplete="name" error={formState.errors.fullName?.message} {...register("fullName")} />
      <TextField label="Số điện thoại" type="tel" autoComplete="tel" error={formState.errors.phone?.message} {...register("phone")} />
      <TextField label="Địa chỉ" autoComplete="street-address" error={formState.errors.address?.message} {...register("address")} />
      <div className={styles.actions}>
        <Button type="submit" loading={update.isPending}>
          Lưu thay đổi
        </Button>
      </div>
    </form>
  );
}
