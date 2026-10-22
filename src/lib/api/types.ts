import type { components, paths } from "./schema";

type Schemas = components["schemas"];

export type Me = Schemas["Me"];
export type User = Schemas["User"];
type GeneratedProduct = Schemas["Product"];
export type Product = Omit<GeneratedProduct, "cpuBrand" | "gpuBrand" | "gpuType" | "resolutionTier" | "panelType"> &
  Partial<Pick<GeneratedProduct, "cpuBrand" | "gpuBrand" | "gpuType" | "resolutionTier" | "panelType">>;
type GeneratedPricedProduct = Schemas["PricedProduct"];
export type PricedProduct = Omit<GeneratedPricedProduct, "cpuBrand" | "gpuBrand" | "gpuType" | "resolutionTier" | "panelType" | "salePrice" | "productDiscountAmount" | "promotion"> &
  Partial<Pick<GeneratedPricedProduct, "cpuBrand" | "gpuBrand" | "gpuType" | "resolutionTier" | "panelType" | "salePrice" | "productDiscountAmount" | "promotion">>;
type GeneratedCatalogProduct = Schemas["CatalogProduct"];
export type CatalogProduct = Omit<GeneratedCatalogProduct, "cpuBrand" | "gpuBrand" | "gpuType" | "resolutionTier" | "panelType" | "salePrice" | "productDiscountAmount" | "promotion"> &
  Partial<Pick<GeneratedCatalogProduct, "cpuBrand" | "gpuBrand" | "gpuType" | "resolutionTier" | "panelType" | "salePrice" | "productDiscountAmount" | "promotion">>;
export type AdvisorRequest = Schemas["AdvisorRequest"];
export type AdvisorRecommendation = Omit<Schemas["AdvisorRecommendation"], "product"> & { product: PricedProduct };
export type AdvisorResult = Omit<Schemas["AdvisorResult"], "recommendations"> & { recommendations: AdvisorRecommendation[] };
type GeneratedCart = Schemas["Cart"];
type GeneratedCartItem = GeneratedCart["items"][number];
export type CartItem = Omit<GeneratedCartItem, "product" | "listLineTotal" | "productDiscountAmount"> &
  Partial<Pick<GeneratedCartItem, "listLineTotal" | "productDiscountAmount">> & { product: PricedProduct };
export type Cart = Omit<GeneratedCart, "items" | "productDiscount" | "totalAfterProductDiscount"> &
  Partial<Pick<GeneratedCart, "productDiscount" | "totalAfterProductDiscount">> & { items: CartItem[] };
type GeneratedOrder = Schemas["Order"];
export type Order = Omit<GeneratedOrder, "subtotalPrice" | "productDiscountAmount" | "couponEligibleSubtotal" | "couponDiscountAmount" | "couponCode" | "couponName" | "paymentRequired"> &
  Partial<Pick<GeneratedOrder, "subtotalPrice" | "productDiscountAmount" | "couponEligibleSubtotal" | "couponDiscountAmount" | "couponCode" | "couponName" | "paymentRequired">>;
export type OrderStatus = Order["status"];
export type PricingQuote = Schemas["PricingQuote"];
export type PublicPromotion = Schemas["PublicPromotion"];
export type PromotionSummary = Schemas["PromotionSummary"];
export type PromotionDetail = Schemas["PromotionDetail"];
export type PromotionRedemption = Schemas["PromotionRedemption"];
export type PromotionStats = Schemas["PromotionStats"];
export type StockMovement = Schemas["StockMovement"];
export type StockReceiptItem = Schemas["StockReceiptItem"];
export type StockReceiptSummary = Schemas["StockReceiptSummary"];
export type StockReceiptDetail = Schemas["StockReceiptDetail"];
type GeneratedAdminOrder = Schemas["AdminOrder"];
type OrderPricingFields = "subtotalPrice" | "productDiscountAmount" | "couponEligibleSubtotal" | "couponDiscountAmount" | "couponCode" | "couponName" | "paymentRequired";
export type AdminOrder = Omit<GeneratedAdminOrder, OrderPricingFields> & Partial<Pick<GeneratedAdminOrder, OrderPricingFields>>;
export type AdminOrderDetail = Omit<Schemas["AdminOrderDetail"], OrderPricingFields> & Partial<Pick<Schemas["AdminOrderDetail"], OrderPricingFields>>;
export type PaymentEvent = Schemas["PaymentEvent"];
export type Role = Schemas["Role"];
export type PublicOfficialReply = { content: string; createdAt: string; updatedAt: string };
export type PublicReview = Omit<Schemas["PublicReview"], "officialReply"> & { officialReply: PublicOfficialReply | null };
export type ReviewImage = Schemas["ReviewImage"];
export type ReviewSummary = Schemas["ReviewSummary"];
export type OwnerReview = Schemas["OwnerReview"];
export type ReviewEligibility = Omit<Schemas["ReviewEligibility"], "existingReview"> & {
  existingReview: OwnerReview | null;
};
export type HelpfulReviewState = Schemas["HelpfulReviewState"];
export type HelpfulMutation = Schemas["HelpfulMutation"];
export type AdminReviewListItem = Schemas["AdminReviewListItem"];
export type AdminReviewDetail = Omit<Schemas["AdminReviewDetail"], "officialReply"> & { officialReply: AdminOfficialReply | null };
export type AdminReviewSummary = Schemas["AdminReviewSummary"];
export type AdminOfficialReply = PublicOfficialReply & { id: number; createdBy: User; updatedBy: User };
type GeneratedFilterOptions =
  paths["/api/v1/products/filters"]["get"]["responses"][200]["content"]["application/json"]["data"];
export type FilterOptions = Omit<GeneratedFilterOptions, "facetDefinitions"> &
  Partial<Pick<GeneratedFilterOptions, "facetDefinitions">>;
export type FilterOption = FilterOptions["factoryOptions"][number];
export type FacetDefinition = NonNullable<GeneratedFilterOptions["facetDefinitions"]>[number];
export type ProductQuery = NonNullable<paths["/api/v1/products"]["get"]["parameters"]["query"]>;
export type ProductFacetsQuery = NonNullable<paths["/api/v1/products/facets"]["get"]["parameters"]["query"]>;
export type ProductFacets =
  paths["/api/v1/products/facets"]["get"]["responses"][200]["content"]["application/json"]["data"];
export type PageMeta = { page: number; pageSize: number; total: number; totalPages: number };
export type ProductReviewsQuery = NonNullable<paths["/api/v1/products/{id}/reviews"]["get"]["parameters"]["query"]>;
export type AdminReviewsQuery = NonNullable<paths["/api/v1/admin/reviews"]["get"]["parameters"]["query"]>;
