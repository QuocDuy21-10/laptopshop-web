import type { UploadFile } from "antd";
import type { Dayjs } from "dayjs";

export type BannerFormValues = {
  placement: "HERO" | "SIDE";
  eyebrow?: string;
  title: string;
  highlight?: string;
  description?: string;
  ctaText?: string;
  linkUrl?: string;
  secondaryCtaText?: string;
  secondaryLinkUrl?: string;
  badges?: string[];
  position?: number;
  isActive?: boolean;
  schedule?: [Dayjs | null, Dayjs | null] | null;
  image?: UploadFile[];
  imageAlt?: string;
};

// mirrors the API rule (laptopshop-api home-banners.schema.ts); the server stays the authority
export const isSafeBannerLink = (value: string): boolean => {
  if (value === "" || value.includes("\\")) return false;
  if ([...value].some((char) => char.trim() === "" || char.charCodeAt(0) < 32 || char === "\u007f")) return false;
  if (value.startsWith("/")) return !value.startsWith("//");
  if (!value.startsWith("https://")) return false;
  try {
    return new URL(value).hostname !== "";
  } catch {
    return false;
  }
};

const blank = (value?: string) => value?.trim() || null;

const common = (v: BannerFormValues) => ({
  title: v.title.trim(),
  eyebrow: blank(v.eyebrow),
  highlight: blank(v.highlight),
  description: blank(v.description),
  linkUrl: blank(v.linkUrl),
  position: v.position ?? 0,
  isActive: v.isActive ?? false,
  startsAt: v.schedule?.[0]?.toISOString() ?? null,
  endsAt: v.schedule?.[1]?.toISOString() ?? null,
});

const heroOnly = (v: BannerFormValues) => ({
  ctaText: blank(v.ctaText),
  secondaryCtaText: blank(v.secondaryCtaText),
  secondaryLinkUrl: blank(v.secondaryLinkUrl),
  badges: (v.badges ?? []).map((badge) => badge.trim()).filter(Boolean),
});

// a SIDE card must not send hero-only fields: the API rejects them
const fields = (v: BannerFormValues) => (v.placement === "HERO" ? { ...common(v), ...heroOnly(v) } : common(v));

export const toCreateBody = (v: BannerFormValues) => ({ placement: v.placement, ...fields(v) });

// null (not undefined) clears a stored value on PATCH; placement is immutable so it is never sent
export const toPatchBody = (v: BannerFormValues, imageAlt?: string) => ({
  ...fields(v),
  ...(imageAlt === undefined ? {} : { imageAlt: imageAlt.trim() }),
});
