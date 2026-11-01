import dayjs from "dayjs";
import { describe, expect, it } from "vitest";
import {
  isSafeBannerLink,
  toCreateBody,
  toPatchBody,
  type BannerFormValues,
} from "@/features/admin/home-banners/form";

const hero = (over: Partial<BannerFormValues> = {}): BannerFormValues => ({
  placement: "HERO",
  title: "  Gaming 2026 ",
  ...over,
});

describe("isSafeBannerLink", () => {
  it("accepts internal paths and https urls", () => {
    expect(isSafeBannerLink("/products?target=GAMING")).toBe(true);
    expect(isSafeBannerLink("https://example.com/sale")).toBe(true);
  });

  it("rejects dangerous or ambiguous links", () => {
    for (const bad of ["//evil.com", "/\\evil.com", "javascript:alert(1)", "data:x", "http://a.com", "https://", "products", "/a b", ""]) {
      expect(isSafeBannerLink(bad)).toBe(false);
    }
  });
});

describe("toCreateBody", () => {
  it("builds a minimal hero body with defaults and trimmed text", () => {
    expect(toCreateBody(hero())).toEqual({
      placement: "HERO",
      title: "Gaming 2026",
      eyebrow: null,
      highlight: null,
      description: null,
      linkUrl: null,
      ctaText: null,
      secondaryCtaText: null,
      secondaryLinkUrl: null,
      badges: [],
      position: 0,
      isActive: false,
      startsAt: null,
      endsAt: null,
    });
  });

  it("turns blank strings into null and trims badges", () => {
    const body = toCreateBody(
      hero({
        eyebrow: "  ",
        ctaText: " Xem ngay ",
        linkUrl: " /products ",
        badges: [" RTX 50 ", " "],
        position: 3,
        isActive: true,
      }),
    );
    expect(body).toMatchObject({
      eyebrow: null,
      ctaText: "Xem ngay",
      linkUrl: "/products",
      badges: ["RTX 50"],
      position: 3,
      isActive: true,
    });
  });

  it("drops hero-only fields for a side card", () => {
    const body = toCreateBody({
      placement: "SIDE",
      title: "Sinh viên",
      linkUrl: "/products?target=SINHVIEN_VANPHONG",
      ctaText: "x",
      secondaryCtaText: "y",
      secondaryLinkUrl: "/a",
      badges: ["z"],
    });
    expect(body).toEqual({
      placement: "SIDE",
      title: "Sinh viên",
      eyebrow: null,
      highlight: null,
      description: null,
      linkUrl: "/products?target=SINHVIEN_VANPHONG",
      position: 0,
      isActive: false,
      startsAt: null,
      endsAt: null,
    });
  });

  it("serializes the schedule as ISO strings", () => {
    const start = dayjs("2026-11-01T08:00:00.000Z");
    const end = dayjs("2026-11-05T08:00:00.000Z");
    const body = toCreateBody(hero({ schedule: [start, end] }));
    expect(body.startsAt).toBe("2026-11-01T08:00:00.000Z");
    expect(body.endsAt).toBe("2026-11-05T08:00:00.000Z");
    expect(toCreateBody(hero({ schedule: [start, null] })).endsAt).toBeNull();
  });
});

describe("toPatchBody", () => {
  it("never sends placement and sends nulls so a cleared field is cleared", () => {
    const body = toPatchBody(hero({ ctaText: "", linkUrl: "" }));
    expect(body).not.toHaveProperty("placement");
    expect(body).toMatchObject({ ctaText: null, linkUrl: null });
    expect(body).not.toHaveProperty("imageAlt");
  });

  it("includes imageAlt only when given", () => {
    expect(toPatchBody(hero(), " Laptop gaming ")).toMatchObject({ imageAlt: "Laptop gaming" });
  });
});
