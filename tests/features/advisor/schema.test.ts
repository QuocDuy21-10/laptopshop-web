import { advisorFormSchema } from "@/features/advisor/schema";
import { describe, expect, it } from "vitest";

describe("advisorFormSchema", () => {
  it("coerces form values into the API contract", () => {
    expect(
      advisorFormSchema.parse({
        budgetMax: "20000000",
        usage: "CODING",
        priorities: ["PERFORMANCE", "PORTABILITY"],
        minRamGb: "16",
        workloads: ["DOCKER_VM"],
        note: "  chạy Docker  ",
      }),
    ).toEqual({
      budgetMax: 20_000_000,
      usage: "CODING",
      priorities: ["PERFORMANCE", "PORTABILITY"],
      minRamGb: 16,
      workloads: ["DOCKER_VM"],
      note: "chạy Docker",
    });
  });

  it.each([
    { budgetMax: "4999999" },
    { budgetMax: "200000001" },
    { priorities: ["PERFORMANCE", "PERFORMANCE"] },
    { note: "a".repeat(501) },
  ])("rejects invalid form values %j", (override) => {
    expect(() =>
      advisorFormSchema.parse({
        budgetMax: "20000000",
        usage: "CODING",
        priorities: [],
        workloads: [],
        ...override,
      }),
    ).toThrow();
  });
});
