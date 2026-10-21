import { z } from "zod";

export const reviewSchema = z.object({
  rating: z.number({ error: "Hãy chọn số sao từ 1 đến 5." }).int().min(1, "Hãy chọn số sao từ 1 đến 5.").max(5, "Chỉ được chọn tối đa 5 sao."),
  title: z.string().trim().max(150, "Tiêu đề tối đa 150 ký tự.").optional(),
  content: z.string().trim().min(10, "Nhận xét cần ít nhất 10 ký tự.").max(1500, "Nhận xét tối đa 1.500 ký tự."),
  isAnonymous: z.boolean({ error: "Hãy chọn cách hiển thị tên." }),
});

export type ReviewInput = z.infer<typeof reviewSchema>;
