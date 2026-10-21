"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Alert } from "@/components/ui/Alert/Alert";
import { Button } from "@/components/ui/Button/Button";
import { TextField } from "@/components/ui/TextField/TextField";
import { errorMessage } from "@/lib/api/errors";
import { applyFieldErrors } from "@/lib/forms";
import type { OwnerReview } from "@/lib/api/types";
import { reviewSchema, type ReviewInput } from "../schema";
import { ReviewImagesEditor, type ReviewImagesState } from "../ReviewImagesEditor/ReviewImagesEditor";
import styles from "./ReviewForm.module.scss";

type Props = {
  fullName: string | null;
  review?: OwnerReview | null;
  onSubmit: (input: ReviewInput) => Promise<void>;
  onImagesChange?: (state: ReviewImagesState) => void;
  imageError?: string | null;
};

export function ReviewForm({ fullName, review, onSubmit, onImagesChange, imageError }: Props) {
  const [formError, setFormError] = useState<string | null>(null);
  const { register, handleSubmit, setError, formState } = useForm<ReviewInput>({
    resolver: zodResolver(reviewSchema),
    defaultValues: { rating: review?.rating, title: review?.title ?? "", content: review?.content ?? "", isAnonymous: review?.isAnonymous },
  });
  const identityError = formState.errors.isAnonymous?.message ?? (formState.isSubmitted && review?.isAnonymous === undefined ? "Hãy chọn cách hiển thị tên." : undefined);
  const submit = handleSubmit(async (values) => {
    setFormError(null);
    try { await onSubmit(values); } catch (error) {
      if (!applyFieldErrors(error, setError)) setFormError(errorMessage(error));
    }
  });
  return (
    <form className={styles.form} onSubmit={submit} noValidate>
      {(formError || imageError) && <Alert tone="error" title={imageError ?? formError ?? "Đã có lỗi xảy ra."} />}
      {review?.status === "HIDDEN" && <Alert tone="warning" title="Đánh giá đang được ẩn. Nội dung sửa vẫn cần admin khôi phục." />}
      <fieldset className={styles.fieldset}>
        <legend>Số sao <span aria-hidden="true">*</span></legend>
        <div className={styles.stars}>
          {[1, 2, 3, 4, 5].map((rating) => <label key={rating}><input type="radio" value={rating} {...register("rating", { valueAsNumber: true })} />{rating} sao</label>)}
        </div>
        {formState.errors.rating?.message && <p className={styles.error}>{formState.errors.rating.message}</p>}
      </fieldset>
      <TextField label="Tiêu đề" {...register("title")} error={formState.errors.title?.message} />
      <label className={styles.textareaLabel} htmlFor="review-content">Nội dung <span aria-hidden="true">*</span></label>
      <textarea id="review-content" className={styles.textarea} rows={5} {...register("content")} />
      {formState.errors.content?.message && <p className={styles.error}>{formState.errors.content.message}</p>}
      <fieldset className={styles.fieldset}>
        <legend>Hiển thị tên <span aria-hidden="true">*</span></legend>
        <label><input type="radio" value="true" {...register("isAnonymous", { required: "Hãy chọn cách hiển thị tên.", setValueAs: (value) => value === "true" })} /> Ẩn danh — hiển thị ****</label>
        <label><input aria-label="Công khai tên" type="radio" value="false" disabled={!fullName} {...register("isAnonymous", { required: "Hãy chọn cách hiển thị tên.", setValueAs: (value) => value === "true" })} /> Công khai tên{!fullName && " — hãy cập nhật họ tên trước"}</label>
        {identityError && <p className={styles.error}>{identityError}</p>}
      </fieldset>
      <ReviewImagesEditor images={review?.images ?? []} onChange={onImagesChange ?? (() => undefined)} />
      <Button type="submit" size="lg" fullWidth loading={formState.isSubmitting}>Gửi đánh giá</Button>
    </form>
  );
}
