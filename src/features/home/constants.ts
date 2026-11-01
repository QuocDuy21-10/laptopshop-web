export const HOME_PRODUCT_LIMIT = 8;
export const REVIEW_LIMIT = 6;

export const bestsellersHref = (target: string) =>
  `/products?sort=sold_desc${target ? `&target=${encodeURIComponent(target)}` : ""}`;
