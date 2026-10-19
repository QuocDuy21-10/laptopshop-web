import { beforeEach, describe, expect, it, vi } from "vitest";
import { downloadCsv } from "@/lib/api/download";
import { json, mockFetch } from "../utils";

let fetchMock: ReturnType<typeof mockFetch>;
beforeEach(() => {
  fetchMock = mockFetch();
  URL.createObjectURL = vi.fn(() => "blob:x");
  URL.revokeObjectURL = vi.fn();
});

describe("downloadCsv", () => {
  it("sends the filters and saves under the server's file name", async () => {
    const click = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
    fetchMock.mockResolvedValue(
      new Response("﻿a\r\n", {
        status: 200,
        headers: { "Content-Type": "text/csv", "Content-Disposition": 'attachment; filename="orders-2026-10-19.csv"' },
      }),
    );
    const name = await downloadCsv("/api/v1/admin/orders/export.csv", { status: "PENDING", q: undefined });
    expect(name).toBe("orders-2026-10-19.csv");
    const url = new URL((fetchMock.mock.calls[0][0] as Request).url);
    expect(url.searchParams.get("status")).toBe("PENDING");
    expect(url.searchParams.has("q")).toBe(false);
    expect(click).toHaveBeenCalled();
  });

  it("turns an API error into an ApiError", async () => {
    fetchMock.mockResolvedValue(json(400, { error: { code: "EXPORT_TOO_LARGE", message: "x" } }));
    await expect(downloadCsv("/api/v1/admin/orders/export.csv", {})).rejects.toMatchObject({ code: "EXPORT_TOO_LARGE" });
  });
});
