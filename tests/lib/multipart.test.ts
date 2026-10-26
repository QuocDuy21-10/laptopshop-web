import { describe, expect, it } from "vitest";
import { sendMultipart, toFormData } from "@/lib/api/multipart";
import { json, lastRequest, mockFetch } from "../utils";

describe("toFormData", () => {
  it("skips null and undefined, keeps empty strings and numbers, adds files", () => {
    const file = new File(["x"], "a.png", { type: "image/png" });
    const form = toFormData({ name: "A", price: 100, phone: "", note: undefined, q: null }, { image: file, avatar: undefined });
    expect(form.get("name")).toBe("A");
    expect(form.get("price")).toBe("100");
    expect(form.get("phone")).toBe("");
    expect(form.has("note")).toBe(false);
    expect(form.has("q")).toBe(false);
    expect(form.has("avatar")).toBe(false);
    expect((form.get("image") as File).name).toBe("a.png");
  });

  it("appends every file when a multipart field contains an array", () => {
    const files = [new File(["one"], "one.png", { type: "image/png" }), new File(["two"], "two.png", { type: "image/png" })];
    const form = toFormData({}, { images: files });
    expect(form.getAll("images").map((file) => (file as File).name)).toEqual(["one.png", "two.png"]);
  });
});

describe("sendMultipart", () => {
  it("sends the form with the given method and returns the body", async () => {
    const fetchMock = mockFetch();
    fetchMock.mockResolvedValue(json(201, { data: { id: 1 } }));
    await expect(sendMultipart("/api/v1/admin/products", "POST", toFormData({ name: "A" }))).resolves.toEqual({
      data: { id: 1 },
    });
    const request = lastRequest(fetchMock);
    expect(request.method).toBe("POST");
    expect(new URL(request.url).pathname).toBe("/api/v1/admin/products");
  });

  it("sends PUT multipart requests without overriding the browser boundary", async () => {
    const fetchMock = mockFetch();
    fetchMock.mockResolvedValue(json(200, { data: { imageVersion: 1 } }));
    await expect(
      sendMultipart("/api/v1/reviews/18/images/sync", "PUT", toFormData({ manifest: "{}" }), {
        "Idempotency-Key": "sync-key",
      }),
    ).resolves.toEqual({ data: { imageVersion: 1 } });
    const request = lastRequest(fetchMock);
    expect(request.method).toBe("PUT");
    expect(request.headers.get("Idempotency-Key")).toBe("sync-key");
    expect(request.headers.get("content-type")).toContain("multipart/form-data");
  });

  it("throws the API error", async () => {
    mockFetch().mockResolvedValue(json(409, { error: { code: "PRODUCT_IN_USE", message: "x" } }));
    await expect(sendMultipart("/api/v1/admin/products/1", "PATCH", new FormData())).rejects.toMatchObject({
      status: 409,
      code: "PRODUCT_IN_USE",
    });
  });

  it("maps a network failure", async () => {
    mockFetch().mockRejectedValue(new TypeError("Failed to fetch"));
    await expect(sendMultipart("/api/v1/admin/products", "POST", new FormData())).rejects.toMatchObject({
      code: "NETWORK_ERROR",
    });
  });
});
