import { z } from "zod";

export const profileSchema = z.object({
  fullName: z.string().trim().min(1, "Vui lòng nhập họ tên").max(255, "Họ tên quá dài"),
  phone: z
    .string()
    .trim()
    .regex(/^([0-9+().\s-]{8,20})?$/, "Số điện thoại không hợp lệ"),
  address: z.string().trim().max(255, "Địa chỉ quá dài"),
});
export type ProfileInput = z.infer<typeof profileSchema>;

export const MAX_AVATAR_BYTES = 3 * 1024 * 1024;
export const AVATAR_TYPES = ["image/png", "image/jpeg"];
