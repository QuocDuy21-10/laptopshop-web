export const queryKeys = {
  me: ["me"] as const,
  cart: ["cart"] as const,
  ordersAll: ["orders"] as const,
  orders: (page: number) => ["orders", page] as const,
  order: (id: number) => ["order", id] as const,
  productFilters: ["product-filters"] as const,
  // admin mutations invalidate adminAll: every admin list, detail and the dashboard
  adminAll: ["admin"] as const,
  adminMovements: (query: object) => ["admin", "movements", query] as const,
  adminDashboard: ["admin", "dashboard"] as const,
  adminProducts: (query: object) => ["admin", "products", query] as const,
  adminProduct: (id: number) => ["admin", "product", id] as const,
  adminOrders: (query: object) => ["admin", "orders", query] as const,
  adminOrder: (id: number) => ["admin", "order", id] as const,
  adminUsers: (query: object) => ["admin", "users", query] as const,
  adminUser: (id: number) => ["admin", "user", id] as const,
  adminRoles: ["admin", "roles"] as const,
};
