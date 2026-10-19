import { describe, expect, it } from "vitest";
import { bestIndexes, formatSpec, SPEC_ROWS } from "@/features/compare/specs";

const row = (key: string) => SPEC_ROWS.find((r) => r.key === key)!;

describe("bestIndexes", () => {
  it("picks the highest or lowest value", () => {
    expect(bestIndexes([8, 16, 12], "higher")).toEqual(new Set([1]));
    expect(bestIndexes([2300, 1290, 1650], "lower")).toEqual(new Set([1]));
  });

  it("marks every tied best value", () => {
    expect(bestIndexes([16, 8, 16], "higher")).toEqual(new Set([0, 2]));
  });

  it("marks nothing when all values are equal or fewer than two are known", () => {
    expect(bestIndexes([16, 16], "higher")).toEqual(new Set());
    expect(bestIndexes([16, null, null], "higher")).toEqual(new Set());
  });

  it("ignores missing values", () => {
    expect(bestIndexes([null, 8, 16], "higher")).toEqual(new Set([2]));
  });
});

describe("formatSpec", () => {
  it("formats units in Vietnamese notation", () => {
    expect(formatSpec(row("ramGb"), 16)).toBe("16 GB");
    expect(formatSpec(row("storageGb"), 512)).toBe("512 GB");
    expect(formatSpec(row("storageGb"), 1024)).toBe("1 TB");
    expect(formatSpec(row("screenSizeInch"), 15.6)).toBe("15,6 inch");
    expect(formatSpec(row("refreshRateHz"), 144)).toBe("144 Hz");
    expect(formatSpec(row("batteryWh"), 48)).toBe("48 Wh");
    expect(formatSpec(row("weightGrams"), 1290)).toBe("1,29 kg");
    expect(formatSpec(row("weightGrams"), 999)).toBe("0,999 kg");
    expect(formatSpec(row("warrantyMonths"), 24)).toBe("24 tháng");
    expect(formatSpec(row("cpu"), "Apple M1")).toBe("Apple M1");
  });

  it("returns null for missing values", () => {
    expect(formatSpec(row("ramGb"), null)).toBeNull();
    expect(formatSpec(row("cpu"), undefined)).toBeNull();
  });

  it("lists the ten specs in display order with directions", () => {
    expect(SPEC_ROWS.map((r) => [r.key, r.better ?? null])).toEqual([
      ["cpu", null],
      ["gpu", null],
      ["ramGb", "higher"],
      ["storageGb", "higher"],
      ["screenSizeInch", null],
      ["screenResolution", null],
      ["refreshRateHz", "higher"],
      ["batteryWh", "higher"],
      ["weightGrams", "lower"],
      ["warrantyMonths", "higher"],
    ]);
  });
});
