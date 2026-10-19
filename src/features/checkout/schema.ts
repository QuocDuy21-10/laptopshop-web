import { z } from "zod";

export const receiverSchema = z.object({
  receiverName: z.string().trim().min(1, "Vui lòng nhập tên người nhận").max(255, "Tên quá dài"),
  receiverPhone: z
    .string()
    .trim()
    .regex(/^[0-9+().\s-]{8,20}$/, "Số điện thoại không hợp lệ"),
  receiverAddress: z.string().trim().min(1, "Vui lòng nhập địa chỉ nhận hàng").max(255, "Địa chỉ quá dài"),
  paymentMethod: z.enum(["COD", "BANK_TRANSFER"]).default("COD"),
});
export type ReceiverInput = z.input<typeof receiverSchema>;
export type PaymentMethod = NonNullable<ReceiverInput["paymentMethod"]>;
