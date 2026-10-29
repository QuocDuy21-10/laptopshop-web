import { describe, expect, it } from "vitest";
import { registerSchema, resetPasswordSchema } from "@/features/auth/schemas";

describe("auth schemas", () => {
  it("flags an empty confirmPassword on an empty register form", () => {
    const r = registerSchema.safeParse({ fullName: "", username: "", password: "", confirmPassword: "" });
    expect(r.success).toBe(false);
    expect(r.error?.issues.map((i) => i.path[0])).toContain("confirmPassword");
  });

  it("flags an empty confirmPassword on reset password", () => {
    const r = resetPasswordSchema.safeParse({ code: "", password: "", confirmPassword: "" });
    expect(r.error?.issues.map((i) => i.path[0])).toContain("confirmPassword");
  });

  it("flags a mismatch once the other fields are valid", () => {
    const r = registerSchema.safeParse({ fullName: "A", username: "a@b.co", password: "12345678", confirmPassword: "x" });
    expect(r.error?.issues[0].message).toBe("Mật khẩu xác nhận không khớp");
  });
});
