"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { Alert } from "@/components/ui/Alert/Alert";
import { Button } from "@/components/ui/Button/Button";
import { TextField } from "@/components/ui/TextField/TextField";
import { errorMessage, isApiError } from "@/lib/api/errors";
import { applyFieldErrors } from "@/lib/forms";
import { advisorFormSchema, type AdvisorFormInput, type AdvisorFormOutput } from "../schema";
import styles from "./AdvisorForm.module.scss";

type Props = {
  onSubmit: (input: AdvisorFormInput) => void | Promise<void>;
  onRetry?: () => void;
  pending: boolean;
  serverError?: unknown;
};

const usageOptions = [
  ["CODING", "Lập trình / CNTT"],
  ["GAMING", "Gaming"],
  ["OFFICE", "Học tập / Văn phòng"],
  ["CREATIVE", "Thiết kế sáng tạo"],
] as const;
const priorityOptions = [
  ["PERFORMANCE", "Hiệu năng"],
  ["PORTABILITY", "Mỏng nhẹ"],
  ["BATTERY", "Pin lâu"],
  ["DISPLAY", "Màn hình"],
  ["VALUE", "Giá trị"],
] as const;
const workloadOptions = [
  ["DOCKER_VM", "Docker / máy ảo"],
  ["ESPORTS", "Game eSports"],
  ["AAA_GAMING", "Game AAA"],
  ["PHOTO_VIDEO", "Ảnh / video"],
  ["CAD_3D", "CAD / 3D"],
] as const;

type Priority = AdvisorFormOutput["priorities"][number];
type Workload = AdvisorFormOutput["workloads"][number];

export function AdvisorForm({ onSubmit, onRetry, pending, serverError }: Props) {
  const [step, setStep] = useState(1);
  const {
    control,
    register,
    handleSubmit,
    trigger,
    setValue,
    setError,
    formState: { errors },
  } = useForm<AdvisorFormInput>({
    resolver: zodResolver(advisorFormSchema),
    defaultValues: { budgetMax: "", usage: undefined, priorities: [], minRamGb: undefined, workloads: [], note: "" },
    mode: "onTouched",
  });

  useEffect(() => {
    if (serverError && isApiError(serverError, "VALIDATION_ERROR")) applyFieldErrors(serverError, setError);
  }, [serverError, setError]);
  const formError = serverError && !isApiError(serverError, "VALIDATION_ERROR") ? errorMessage(serverError) : null;

  const next = async () => {
    const fields = step === 1 ? (["budgetMax", "usage"] as const) : step === 2 ? (["priorities"] as const) : step === 3 ? (["minRamGb", "workloads"] as const) : ([] as const);
    if (fields.length && !(await trigger(fields))) return;
    setStep((current) => Math.min(4, current + 1));
  };
  const priorities = useWatch({ control, name: "priorities" }) ?? [];
  const workloads = useWatch({ control, name: "workloads" }) ?? [];
  const togglePriority = (value: Priority) => {
    if (priorities.includes(value)) {
      setValue("priorities", priorities.filter((item) => item !== value), { shouldValidate: true });
    } else if (priorities.length < 3) {
      setValue("priorities", [...priorities, value], { shouldValidate: true });
    }
  };
  const toggleWorkload = (value: Workload) => {
    if (workloads.includes(value)) {
      setValue("workloads", workloads.filter((item) => item !== value), { shouldValidate: true });
    } else {
      setValue("workloads", [...workloads, value], { shouldValidate: true });
    }
  };
  const submit = handleSubmit((data) => onSubmit(data));

  return (
    <form className={styles.form} onSubmit={submit} noValidate aria-labelledby="advisor-form-title">
      <div className={styles.header}>
        <p className={styles.step}>Bước {step}/4</p>
        <h2 id="advisor-form-title" className={styles.title}>
          Cho biết nhu cầu của bạn
        </h2>
      </div>
      {formError && (
        <Alert tone="error" title={formError}>
          {onRetry && <Button variant="secondary" onClick={onRetry} disabled={pending}>Thử lại</Button>}
        </Alert>
      )}

      {step === 1 && (
        <div className={styles.content}>
          <TextField
            label="Ngân sách tối đa (₫)"
            type="number"
            inputMode="numeric"
            min={5_000_000}
            max={200_000_000}
            required
            hint="Từ 5 triệu đến 200 triệu đồng."
            error={errors.budgetMax?.message as string | undefined}
            {...register("budgetMax")}
          />
          <fieldset className={styles.fieldset}>
            <legend className={styles.legend}>Bạn dùng laptop chủ yếu cho việc gì?</legend>
            {usageOptions.map(([value, label]) => (
              <label className={styles.choice} key={value}>
                <input type="radio" value={value} {...register("usage")} />
                <span>{label}</span>
              </label>
            ))}
            {errors.usage?.message && <p className={styles.fieldError}>{errors.usage.message as string}</p>}
          </fieldset>
        </div>
      )}

      {step === 2 && (
        <fieldset className={styles.fieldset}>
          <legend className={styles.legend}>Bạn ưu tiên điều gì? (tối đa 3)</legend>
          <div className={styles.choiceGrid}>
            {priorityOptions.map(([value, label]) => (
              <label className={styles.choice} key={value}>
                <input type="checkbox" checked={priorities.includes(value)} onChange={() => togglePriority(value)} />
                <span>{label}</span>
              </label>
            ))}
          </div>
          {priorities.length >= 3 && <p className={styles.hint}>Chỉ chọn tối đa 3 ưu tiên.</p>}
        </fieldset>
      )}

      {step === 3 && (
        <div className={styles.content}>
          <fieldset className={styles.fieldset}>
            <legend className={styles.legend}>RAM tối thiểu</legend>
            <label className={styles.choice}><input type="radio" value="" defaultChecked {...register("minRamGb")} /><span>Không bắt buộc</span></label>
            {[8, 16, 32].map((value) => (
              <label className={styles.choice} key={value}><input type="radio" value={value} {...register("minRamGb")} /><span>{value} GB</span></label>
            ))}
          </fieldset>
          <fieldset className={styles.fieldset}>
            <legend className={styles.legend}>Bạn thường làm gì? (không bắt buộc)</legend>
            <div className={styles.choiceGrid}>
              {workloadOptions.map(([value, label]) => (
                <label className={styles.choice} key={value}>
                  <input type="checkbox" checked={workloads.includes(value)} onChange={() => toggleWorkload(value)} />
                  <span>{label}</span>
                </label>
              ))}
            </div>
          </fieldset>
        </div>
      )}

      {step === 4 && (
        <div className={styles.content}>
          <label className={styles.textareaLabel} htmlFor="advisor-note">Yêu cầu thêm</label>
          <textarea id="advisor-note" className={styles.textarea} maxLength={500} {...register("note")} />
          <p className={styles.hint}>Chỉ dùng để cá nhân hóa lời tư vấn, không thay đổi thứ hạng.</p>
          {errors.note?.message && <p className={styles.fieldError}>{errors.note.message as string}</p>}
        </div>
      )}

      <div className={styles.actions}>
        {step > 1 && <Button type="button" variant="secondary" onClick={() => setStep((current) => current - 1)} disabled={pending}>Quay lại</Button>}
        {step < 4 ? (
          <Button key={step} type="button" onClick={() => void next()} disabled={pending}>Tiếp tục</Button>
        ) : (
          <Button key={step} type="submit" loading={pending}>Nhận tư vấn</Button>
        )}
      </div>
    </form>
  );
}
