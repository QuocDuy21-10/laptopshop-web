import { z } from "zod";

export const newsletterSubscribeSchema = z.object({
  email: z.string().trim().email("Email không hợp lệ").max(254, "Email quá dài"),
});
export type NewsletterSubscribeInput = z.infer<typeof newsletterSubscribeSchema>;
