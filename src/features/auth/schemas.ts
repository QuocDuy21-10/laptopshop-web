import { z } from "zod";

export const loginSchema = z.object({
  username: z.string().trim().email("Email không hợp lệ"),
  password: z.string().min(1, "Vui lòng nhập mật khẩu").max(72, "Mật khẩu tối đa 72 ký tự"),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    fullName: z.string().trim().min(1, "Vui lòng nhập họ tên").max(255, "Họ tên quá dài"),
    username: z.string().trim().email("Email không hợp lệ").max(255, "Email quá dài"),
    password: z.string().min(8, "Mật khẩu tối thiểu 8 ký tự").max(72, "Mật khẩu tối đa 72 ký tự"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmPassword"],
  });
export const forgotPasswordSchema = z.object({
  username: z.string().trim().email("Email không hợp lệ").max(255, "Email quá dài"),
});
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    code: z.string().trim().regex(/^\d{6}$/, "Mã gồm 6 chữ số"),
    password: z.string().min(8, "Mật khẩu tối thiểu 8 ký tự").max(72, "Mật khẩu tối đa 72 ký tự"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmPassword"],
  });
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

export type RegisterInput = z.infer<typeof registerSchema>;
