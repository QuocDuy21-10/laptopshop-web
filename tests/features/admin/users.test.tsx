import { screen } from "@testing-library/react";
import type { UploadFile } from "antd";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { roleIdOf } from "@/features/admin/users/roles";
import { toUserFormData } from "@/features/admin/users/UserFormModal";
import { UserList } from "@/features/admin/users/UserList";
import { json, mockFetch, renderAdmin } from "../../utils";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => "/admin/users",
  useSearchParams: () => new URLSearchParams(),
}));

const ROLES = [
  { id: 1, name: "ADMIN", description: "Quản trị viên" },
  { id: 2, name: "USER", description: null },
];
const user = (id: number, username: string, role: string) => ({
  id, username, fullName: `User ${id}`, address: null, phone: null, accountType: null, avatar: null, role,
});

beforeEach(() => {
  mockFetch().mockImplementation(async (input) => {
    const { pathname } = new URL((input as Request).url);
    if (pathname === "/api/v1/users/me") return json(200, { data: { ...user(1, "admin@gmail.com", "ADMIN"), cartItemCount: 0 } });
    if (pathname === "/api/v1/admin/roles") return json(200, { data: ROLES });
    return json(200, {
      data: [user(1, "admin@gmail.com", "ADMIN"), user(2, "b@test.local", "USER")],
      meta: { page: 1, pageSize: 10, total: 2, totalPages: 1 },
    });
  });
});

describe("roleIdOf", () => {
  it("resolves a role name to its id", () => {
    expect(roleIdOf(ROLES, "USER")).toBe(2);
    expect(roleIdOf(ROLES, "GHOST")).toBeUndefined();
    expect(roleIdOf(undefined, "USER")).toBeUndefined();
  });
});

describe("toUserFormData", () => {
  it("sends the fields and the avatar file, skipping fields the edit form does not have", () => {
    const file = new File(["x"], "me.png", { type: "image/png" });
    const form = toUserFormData({
      fullName: "B", phone: "", address: "HN", roleId: 2,
      avatar: [{ uid: "1", name: "me.png", originFileObj: file as UploadFile["originFileObj"] }],
    });
    expect(form.get("roleId")).toBe("2");
    expect(form.has("username")).toBe(false);
    expect(form.has("password")).toBe(false);
    expect((form.get("avatar") as File).name).toBe("me.png");
  });
});

describe("UserList", () => {
  it("lists users and hides delete on the signed-in admin's own row", async () => {
    renderAdmin(<UserList />);
    expect(await screen.findByText("b@test.local")).toBeInTheDocument();
    expect(screen.getByText("admin@gmail.com")).toBeInTheDocument();
    expect(await screen.findByRole("button", { name: "Xoá" })).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: "Xoá" })).toHaveLength(1);
  });
});
