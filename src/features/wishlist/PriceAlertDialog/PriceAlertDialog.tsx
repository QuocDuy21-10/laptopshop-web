"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Alert } from "@/components/ui/Alert/Alert";
import { Button } from "@/components/ui/Button/Button";
import { Dialog } from "@/components/ui/Dialog/Dialog";
import { TextField } from "@/components/ui/TextField/TextField";
import { errorMessage } from "@/lib/api/errors";
import { formatVnd } from "@/lib/format";
import { useConfigurePriceAlert } from "@/features/wishlist/hooks";
import type { WishlistItem } from "@/lib/api/types";
import { priceAlertFormSchema, type PriceAlertForm } from "../schema";
import styles from "./PriceAlertDialog.module.scss";

export function PriceAlertDialog({
  userId,
  item,
  open,
  onOpenChange,
  flashSaleAlertEnabled = false,
}: {
  userId: number;
  item: WishlistItem;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  flashSaleAlertEnabled?: boolean;
}) {
  const currentPrice =
    item.priceSnapshot?.effectivePrice ?? item.product.salePrice ?? item.product.price;
  const [formError, setFormError] = useState<string | null>(null);
  const configure = useConfigurePriceAlert(userId);
  const { register, handleSubmit, reset, setError, watch, formState } = useForm<PriceAlertForm>({
    defaultValues: {
      mode: item.alertMode === "TARGET_PRICE" ? "TARGET_PRICE" : "PERCENT_DROP",
      targetPrice: item.targetPrice ?? undefined,
      includeFlashSale: item.includeFlashSale ?? false,
    },
  });
  useEffect(() => {
    if (!open) return;
    reset({
      mode: item.alertMode === "TARGET_PRICE" ? "TARGET_PRICE" : "PERCENT_DROP",
      targetPrice: item.targetPrice ?? undefined,
      includeFlashSale: item.includeFlashSale ?? false,
    });
    setFormError(null);
  }, [item.alertMode, item.id, item.includeFlashSale, item.targetPrice, open, reset]);
  const mode = watch("mode");
  const submit = handleSubmit(async (values) => {
    setFormError(null);
    const parsed = priceAlertFormSchema.safeParse(values);
    if (!parsed.success) {
      setError("targetPrice", { message: "Giá mục tiêu không hợp lệ" });
      return;
    }
    if (
      parsed.data.mode === "TARGET_PRICE" &&
      (parsed.data.targetPrice === undefined || parsed.data.targetPrice >= currentPrice)
    ) {
      setError("targetPrice", { message: "Giá mục tiêu phải thấp hơn giá hiện tại" });
      return;
    }
    // the API rejects Flash Sale opt-in while the server flag is off
    const includeFlashSale = flashSaleAlertEnabled && parsed.data.includeFlashSale;
    try {
      const input =
        parsed.data.mode === "TARGET_PRICE"
          ? {
              mode: "TARGET_PRICE" as const,
              targetPrice: parsed.data.targetPrice!,
              includeFlashSale,
            }
          : { mode: "PERCENT_DROP" as const, includeFlashSale };
      await configure.mutateAsync({ productId: item.productId, input });
      onOpenChange(false);
    } catch (error) {
      setFormError(errorMessage(error));
    }
  });
  const disable = async () => {
    setFormError(null);
    try {
      await configure.mutateAsync({ productId: item.productId, input: { mode: null } });
      onOpenChange(false);
    } catch (error) {
      setFormError(errorMessage(error));
    }
  };
  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title={`Theo dõi giá — ${item.product.name}`}
      description={
        flashSaleAlertEnabled
          ? "Cảnh báo dựa trên giá niêm yết và Automatic Promotion; Flash Sale là tùy chọn."
          : "Cảnh báo dựa trên giá niêm yết và Automatic Promotion."
      }
    >
      <form className={styles.form} onSubmit={submit} noValidate>
        {formError && <Alert tone="error" title={formError} />}
        <p>
          Giá hiện tại: <strong>{formatVnd(currentPrice)}</strong>
        </p>
        <fieldset className={styles.modes}>
          <legend>Điều kiện cảnh báo</legend>
          <label>
            <input type="radio" value="PERCENT_DROP" {...register("mode")} /> Báo khi giảm thêm ít
            nhất 5%
          </label>
          <label>
            <input type="radio" value="TARGET_PRICE" {...register("mode")} /> Báo khi đạt mức giá
            mong muốn
          </label>
        </fieldset>
        {mode === "TARGET_PRICE" && (
          <TextField
            label="Giá mục tiêu"
            type="number"
            inputMode="numeric"
            hint="Phải thấp hơn giá hiện tại."
            error={formState.errors.targetPrice?.message}
            {...register("targetPrice", { valueAsNumber: true })}
          />
        )}
        {flashSaleAlertEnabled && (
          <>
            <label className={styles.flashSale}>
              <input type="checkbox" {...register("includeFlashSale")} /> Theo dõi Flash Sale
            </label>
            <p className={styles.note}>
              Flash Sale phụ thuộc stock và quota; checkout sẽ xác nhận lại giá cuối cùng.
            </p>
          </>
        )}
        <p className={styles.note}>
          Khi đạt giá mục tiêu, hệ thống gửi một thông báo rồi tự động tắt cảnh báo.
        </p>
        <div className={styles.actions}>
          <Button type="submit" loading={configure.isPending}>
            Lưu cảnh báo
          </Button>
          {item.alertMode && (
            <Button
              type="button"
              variant="secondary"
              onClick={disable}
              disabled={configure.isPending}
            >
              Tắt cảnh báo
            </Button>
          )}
        </div>
      </form>
    </Dialog>
  );
}
