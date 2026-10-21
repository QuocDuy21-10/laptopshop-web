import type { components, paths } from "./schema";

type Schemas = components["schemas"];

export type Me = Schemas["Me"];
export type User = Schemas["User"];
type GeneratedProduct = Schemas["Product"];
export type Product = Omit<GeneratedProduct, "cpuBrand" | "gpuBrand" | "gpuType" | "resolutionTier" | "panelType"> &
  Partial<Pick<GeneratedProduct, "cpuBrand" | "gpuBrand" | "gpuType" | "resolutionTier" | "panelType">>;
export type AdvisorRequest = Schemas["AdvisorRequest"];
export type AdvisorRecommendation = Omit<Schemas["AdvisorRecommendation"], "product"> & { product: Product };
export type AdvisorResult = Omit<Schemas["AdvisorResult"], "recommendations"> & { recommendations: AdvisorRecommendation[] };
type GeneratedCart = Schemas["Cart"];
export type CartItem = Omit<GeneratedCart["items"][number], "product"> & { product: Product };
export type Cart = Omit<GeneratedCart, "items"> & { items: CartItem[] };
export type Order = Schemas["Order"];
export type OrderStatus = Order["status"];
export type StockMovement = Schemas["StockMovement"];
export type StockReceiptItem = Schemas["StockReceiptItem"];
export type StockReceiptSummary = Schemas["StockReceiptSummary"];
export type StockReceiptDetail = Schemas["StockReceiptDetail"];
export type AdminOrder = Schemas["AdminOrder"];
export type AdminOrderDetail = Schemas["AdminOrderDetail"];
export type PaymentEvent = Schemas["PaymentEvent"];
export type Role = Schemas["Role"];
export type PublicReview = Schemas["PublicReview"];
export type ReviewImage = Schemas["ReviewImage"];
export type ReviewSummary = Schemas["ReviewSummary"];
export type OwnerReview = Schemas["OwnerReview"];
export type ReviewEligibility = Omit<Schemas["ReviewEligibility"], "existingReview"> & {
  existingReview: OwnerReview | null;
};
export type HelpfulReviewState = Schemas["HelpfulReviewState"];
export type HelpfulMutation = Schemas["HelpfulMutation"];
export type AdminReviewListItem = Schemas["AdminReviewListItem"];
export type AdminReviewDetail = Schemas["AdminReviewDetail"];
export type AdminReviewSummary = Schemas["AdminReviewSummary"];
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
