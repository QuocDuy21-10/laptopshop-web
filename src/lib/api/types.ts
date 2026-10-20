import type { components, paths } from "./schema";

type Schemas = components["schemas"];

export type Me = Schemas["Me"];
export type User = Schemas["User"];
export type Product = Schemas["Product"];
export type AdvisorRequest = Schemas["AdvisorRequest"];
export type AdvisorRecommendation = Schemas["AdvisorRecommendation"];
export type AdvisorResult = Schemas["AdvisorResult"];
export type Cart = Schemas["Cart"];
export type CartItem = Cart["items"][number];
export type Order = Schemas["Order"];
export type OrderStatus = Order["status"];
export type StockMovement = Schemas["StockMovement"];
export type AdminOrder = Schemas["AdminOrder"];
export type AdminOrderDetail = Schemas["AdminOrderDetail"];
export type PaymentEvent = Schemas["PaymentEvent"];
export type Role = Schemas["Role"];
export type FilterOptions =
  paths["/api/v1/products/filters"]["get"]["responses"][200]["content"]["application/json"]["data"];
export type FilterOption = FilterOptions["factoryOptions"][number];
export type ProductQuery = NonNullable<paths["/api/v1/products"]["get"]["parameters"]["query"]>;
export type PageMeta = { page: number; pageSize: number; total: number; totalPages: number };
