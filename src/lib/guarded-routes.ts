// keep in sync with the matcher in src/proxy.ts (Next requires a literal matcher there)
export const GUARDED_PREFIXES = ["/cart", "/checkout", "/wishlist", "/account", "/admin"] as const;

export const isGuardedPath = (path: string) =>
  GUARDED_PREFIXES.some((prefix) => path === prefix || path.startsWith(`${prefix}/`));
