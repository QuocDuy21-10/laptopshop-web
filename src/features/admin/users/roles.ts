import type { Role } from "@/lib/api/types";

// the user list returns the role name; the API takes roleId
export const roleIdOf = (roles: Role[] | undefined, name: string) => roles?.find((r) => r.name === name)?.id;
