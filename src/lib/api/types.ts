import type { components, paths } from "./schema";

type Schemas = components["schemas"];

export type Me = Schemas["Me"];
export type User = Schemas["User"];
type GeneratedProduct = Schemas["Product"];
export type Product = Omit<GeneratedProduct, "cpuBrand" | "gpuBrand" | "gpuType" | "resolutionTier" | "panelType"> &
  Partial<Pick<GeneratedProduct, "cpuBrand" | "gpuBrand" | "gpuType" | "resolutionTier" | "panelType">>;
export type AdvisorRequest = Schemas["AdvisorRequest"];
type GeneratedPricedProduct = Schemas["PricedProduct"];
export type PricedProduct = Omit<GeneratedPricedProduct, "cpuBrand" | "gpuBrand" | "gpuType" | "resolutionTier" | "panelType" | "salePrice" | "productDiscountAmount" | "promotion"> &
  Partial<Pick<GeneratedPricedProduct, "cpuBrand" | "gpuBrand" | "gpuType" | "resolutionTier" | "panelType" | "salePrice" | "productDiscountAmount" | "promotion">>;
type GeneratedCatalogProduct = Schemas["CatalogProduct"];
export type CatalogProduct = Omit<GeneratedCatalogProduct, "cpuBrand" | "gpuBrand" | "gpuType" | "resolutionTier" | "panelType" | "salePrice" | "productDiscountAmount" | "promotion"> &
  Partial<Pick<GeneratedCatalogProduct, "cpuBrand" | "gpuBrand" | "gpuType" | "resolutionTier" | "panelType" | "salePrice" | "productDiscountAmount" | "promotion">>;
export type AdvisorRecommendation = Omit<Schemas["AdvisorRecommendation"], "product"> & { product: PricedProduct };
export type AdvisorResult = Omit<Schemas["AdvisorResult"], "recommendations"> & { recommendations: AdvisorRecommendation[] };
type GeneratedCart = Schemas["Cart"];
type GeneratedCartItem = GeneratedCart["items"][number];
export type CartItem = Omit<GeneratedCartItem, "product" | "listLineTotal" | "productDiscountAmount"> &
  Partial<Pick<GeneratedCartItem, "listLineTotal" | "productDiscountAmount">> & { product: PricedProduct };
export type Cart = Omit<GeneratedCart, "items" | "productDiscount" | "totalAfterProductDiscount"> &
  Partial<Pick<GeneratedCart, "productDiscount" | "totalAfterProductDiscount">> & { items: CartItem[] };
type GeneratedOrder = Schemas["Order"];
type OrderPricingFields = "subtotalPrice" | "productDiscountAmount" | "couponEligibleSubtotal" | "couponDiscountAmount" | "couponCode" | "couponName" | "paymentRequired";
export type Order = Omit<GeneratedOrder, OrderPricingFields> & Partial<Pick<GeneratedOrder, OrderPricingFields>>;
export type OrderStatus = Order["status"];
export type StockMovement = Schemas["StockMovement"];
export type StockReceiptItem = Schemas["StockReceiptItem"];
export type StockReceiptSummary = Schemas["StockReceiptSummary"];
export type StockReceiptDetail = Schemas["StockReceiptDetail"];
type GeneratedAdminOrder = Schemas["AdminOrder"];
export type AdminOrder = Omit<GeneratedAdminOrder, OrderPricingFields> & Partial<Pick<GeneratedAdminOrder, OrderPricingFields>>;
type GeneratedAdminOrderDetail = Schemas["AdminOrderDetail"];
export type AdminOrderDetail = Omit<GeneratedAdminOrderDetail, OrderPricingFields> & Partial<Pick<GeneratedAdminOrderDetail, OrderPricingFields>>;
export type PaymentEvent = Schemas["PaymentEvent"];
export type Role = Schemas["Role"];
type PublicOfficialReply = Schemas["PublicOfficialReply"];
export type PublicReview = Omit<Schemas["PublicReview"], "officialReply"> & { officialReply?: PublicOfficialReply | null };
export type ReviewImage = Schemas["ReviewImage"];
export type ReviewSummary = Schemas["ReviewSummary"];
export type OwnerReview = Schemas["OwnerReview"];
export type ReviewEligibility = Omit<Schemas["ReviewEligibility"], "existingReview"> & {
  existingReview: OwnerReview | null;
};
export type HelpfulReviewState = Schemas["HelpfulReviewState"];
export type HelpfulMutation = Schemas["HelpfulMutation"];
export type AdminReviewListItem = Schemas["AdminReviewListItem"];
type AdminOfficialReply = Schemas["AdminOfficialReply"];
export type AdminReviewDetail = Omit<Schemas["AdminReviewDetail"], "officialReply"> & { officialReply?: AdminOfficialReply | null };
export type AdminReviewSummary = Schemas["AdminReviewSummary"];
export type PriceAlertMode = Schemas["PriceAlertMode"];
export type WishlistItem = Schemas["WishlistItem"];
export type WishlistStatus = Schemas["WishlistStatus"];
export type WishlistSummary = Schemas["WishlistSummary"];
export type WishlistPage = paths["/api/v1/wishlist"]["get"]["responses"][200]["content"]["application/json"];
export type InAppNotification = Schemas["Notification"];
export type NotificationPage = paths["/api/v1/notifications"]["get"]["responses"][200]["content"]["application/json"];
export type ConfigurePriceAlertInput = NonNullable<
  paths["/api/v1/wishlist/items/{productId}"]["patch"]["requestBody"]
>["content"]["application/json"];
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
