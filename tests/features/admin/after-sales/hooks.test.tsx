import { describe, expect, it } from "vitest";
import { queryKeys } from "@/lib/api/query-keys";

describe("admin after-sales hooks", () => {
  it("scopes list cache by query", () => {
    expect(queryKeys.adminAfterSales({ status: "REVIEWING" })).not.toEqual(queryKeys.adminAfterSales({ status: "CLOSED" }));
  });
});
