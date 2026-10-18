import { describe, expect, it } from "vitest";
import { ApiError, errorMessage, fieldErrors, toApiError, unwrap } from "@/lib/api/errors";
import { json } from "../utils";

describe("toApiError", () => {
  it("reads the API error envelope", () => {
    const err = toApiError(409, { error: { code: "OUT_OF_STOCK", message: "Not enough stock", details: { productId: 3 } } });
    expect(err).toMatchObject({ status: 409, code: "OUT_OF_STOCK", details: { productId: 3 } });
  });

  it("falls back for bodies without an envelope (e.g. the 429 limiter)", () => {
    expect(toApiError(429, { data: null, message: "Too many" }).code).toBe("UNKNOWN");
  });
});

describe("errorMessage", () => {
  it("translates known codes and statuses", () => {
    expect(errorMessage(new ApiError(409, "OUT_OF_STOCK", "x"))).toBe("Sản phẩm không đủ số lượng trong kho.");
    expect(errorMessage(new ApiError(429, "UNKNOWN", "x"))).toBe(
      "Bạn thao tác quá nhanh. Vui lòng thử lại sau ít phút.",
    );
    expect(errorMessage(new Error("boom"))).toBe("Đã có lỗi xảy ra. Vui lòng thử lại.");
  });
});

describe("fieldErrors", () => {
  it("maps validation details by path", () => {
    const err = new ApiError(400, "VALIDATION_ERROR", "x", [{ path: "receiverPhone", message: "Too short" }]);
    expect(fieldErrors(err)).toEqual({ receiverPhone: "Too short" });
    expect(fieldErrors(new ApiError(409, "OUT_OF_STOCK", "x"))).toEqual({});
  });
});

describe("unwrap", () => {
  it("returns data on success", async () => {
    await expect(unwrap(Promise.resolve({ data: { ok: 1 }, response: json(200) }))).resolves.toEqual({ ok: 1 });
  });

  it("throws ApiError for error responses", async () => {
    const p = unwrap(Promise.resolve({ error: { error: { code: "NOT_FOUND", message: "x" } }, response: json(404) }));
    await expect(p).rejects.toMatchObject({ status: 404, code: "NOT_FOUND" });
  });

  it("throws NETWORK_ERROR when fetch rejects", async () => {
    await expect(unwrap(Promise.reject(new TypeError("Failed to fetch")))).rejects.toMatchObject({
      status: 0,
      code: "NETWORK_ERROR",
    });
  });
});
