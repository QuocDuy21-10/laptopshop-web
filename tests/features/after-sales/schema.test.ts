import { describe, expect, it } from "vitest";
import { createServiceRequestSchema } from "@/features/after-sales/schema";
import { queryKeys } from "@/lib/api/query-keys";

describe("after-sales schema", () => {
  it("requires at least one device item", () => {
    expect(createServiceRequestSchema.safeParse({ type: "WARRANTY", subject: "X", items: [] }).success).toBe(false);
  });

  it("keeps customer request caches isolated by user", () => {
    expect(queryKeys.afterSalesRequest(7, 12)).not.toEqual(queryKeys.afterSalesRequest(8, 12));
  });
});
