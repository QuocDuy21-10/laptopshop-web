import { describe, expect, it } from "vitest";

import { reviewFormSchema, reviewSchema } from "@/features/reviews/schema";

const formValues = { rating: "5", content: "Nội dung đủ dài.", isAnonymous: "false" };

describe("review form schema", () => {
  it.each([
    ["true", true],
    ["false", false],
  ])("transforms identity %s into %s", (value, expected) => {
    const payload = reviewFormSchema.parse({ ...formValues, isAnonymous: value });

    expect(payload).toEqual({ rating: 5, content: "Nội dung đủ dài.", isAnonymous: expected });
    expect(typeof payload.rating).toBe("number");
    expect(typeof payload.isAnonymous).toBe("boolean");
  });

  it.each(["", "0", "6", "1.5", "05", "5\n", " 5", "5x", null, undefined, 5])(
    "rejects unsupported rating %s",
    (rating) => {
      expect(reviewFormSchema.safeParse({ ...formValues, rating }).success).toBe(false);
    },
  );

  it.each(["", "TRUE", "yes", null, undefined, true, false])(
    "rejects unsupported identity %s",
    (isAnonymous) => {
      expect(reviewFormSchema.safeParse({ ...formValues, isAnonymous }).success).toBe(false);
    },
  );

  it("keeps the API payload schema strict", () => {
    const payload = { rating: 5, content: "Nội dung đủ dài.", isAnonymous: false };

    expect(reviewSchema.safeParse(payload).success).toBe(true);
    expect(reviewSchema.safeParse({ ...payload, rating: "5" }).success).toBe(false);
    expect(reviewSchema.safeParse({ ...payload, isAnonymous: "false" }).success).toBe(false);
  });
});
