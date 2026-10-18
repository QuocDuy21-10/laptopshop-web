import { describe, expect, it } from "vitest";
import { formatDate, formatVnd } from "@/lib/format";

describe("formatVnd", () => {
  it("uses Vietnamese grouping and the đồng sign", () => {
    expect(formatVnd(17_490_000)).toBe("17.490.000 ₫");
    expect(formatVnd(0)).toBe("0 ₫");
  });
});

describe("formatDate", () => {
  it("formats in Vietnam time", () => {
    const text = formatDate("2026-10-18T00:00:00Z");
    expect(text).toContain("2026");
    expect(text).toContain("07:00");
  });
});
