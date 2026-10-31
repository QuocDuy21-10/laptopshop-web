import { z } from "zod";

const ratingError = "Hãy chọn số sao từ 1 đến 5.";
const identityError = "Hãy chọn cách hiển thị tên.";

export const reviewSchema = z.object({
  rating: z
    .number({ error: ratingError })
    .int()
    .min(1, ratingError)
    .max(5, "Chỉ được chọn tối đa 5 sao."),
  title: z.string().trim().max(150, "Tiêu đề tối đa 150 ký tự.").optional(),
  content: z
    .string()
    .trim()
    .min(10, "Nhận xét cần ít nhất 10 ký tự.")
    .max(1500, "Nhận xét tối đa 1.500 ký tự."),
  isAnonymous: z.boolean({ error: identityError }),
});

export type ReviewInput = z.infer<typeof reviewSchema>;

export const reviewFormSchema = reviewSchema.extend({
  rating: z
    .string({ error: ratingError })
    .length(1, ratingError)
    .regex(/^[1-5]$/, ratingError)
    .transform(Number),
  isAnonymous: z
    .enum(["true", "false"], { error: identityError })
    .transform((value) => value === "true"),
});

export type ReviewFormInput = z.input<typeof reviewFormSchema>;
export type ReviewFormOutput = z.output<typeof reviewFormSchema>;
