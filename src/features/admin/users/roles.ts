import type { Role } from "@/lib/api/types";

// the user list returns the role name; the API takes roleId
export const roleIdOf = (roles: Role[] | undefined, name: string) => roles?.find((r) => r.name === name)?.id;

const ROLE_LABEL: Record<string, string> = { ADMIN: "Quản trị viên", USER: "Khách hàng" };

/** Vietnamese role name: the API description when present, else the local label; never the raw key. */
export const roleLabel = (roles: Role[] | undefined, name: string) =>
  roles?.find((r) => r.name === name)?.description || ROLE_LABEL[name] || "Không xác định";
