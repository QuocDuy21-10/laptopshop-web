export const queryKeys = {
  me: ["me"] as const,
  cart: ["cart"] as const,
  ordersAll: ["orders"] as const,
  orders: (page: number) => ["orders", page] as const,
  order: (id: number) => ["order", id] as const,
};
