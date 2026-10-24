import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { UploadFile } from "antd";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { roleIdOf } from "@/features/admin/users/roles";
import { UserDetail } from "@/features/admin/users/UserDetail";
import { toUserFormData, UserFormModal } from "@/features/admin/users/UserFormModal";
import { UserList } from "@/features/admin/users/UserList";
import { ApiError, errorMessage } from "@/lib/api/errors";
import { json, mockFetch, renderAdmin } from "../../utils";

const nav = vi.hoisted(() => ({ push: vi.fn(), search: "" }));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: nav.push }),
  usePathname: () => "/admin/users",
  useSearchParams: () => new URLSearchParams(nav.search),
}));

const ROLES = [
  { id: 1, name: "ADMIN", description: "Quản trị viên" },
  { id: 2, name: "USER", description: null },
];
const user = (id: number, username: string, role: string) => ({
  id, username, fullName: `User ${id}`, address: null, phone: null, accountType: null, avatar: null, emailVerifiedAt: null, role,
});

let fetchMock: ReturnType<typeof mockFetch>;
beforeEach(() => {
  nav.search = "";
  nav.push.mockClear();
  fetchMock = mockFetch();
  fetchMock.mockImplementation(async (input) => {
    const { pathname } = new URL((input as Request).url);
    if (pathname === "/api/v1/users/me") return json(200, { data: { ...user(1, "admin@gmail.com", "ADMIN"), cartItemCount: 0 } });
    if (pathname === "/api/v1/admin/users/2") return json(200, { data: user(2, "b@test.local", "USER") });
    if (pathname === "/api/v1/admin/orders") return json(200, { data: [], meta: { page: 1, pageSize: 10, total: 0, totalPages: 0 } });
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

describe("UserFormModal", () => {
  it("locks the role when the admin edits their own account", async () => {
    renderAdmin(<UserFormModal user={user(1, "admin@gmail.com", "ADMIN")} onClose={() => {}} />);
    expect(await screen.findByText("Bạn không thể đổi vai trò của chính mình.")).toBeInTheDocument();
    expect(screen.getByRole("combobox")).toBeDisabled();
  });

  it("leaves the role editable for other users", async () => {
    renderAdmin(<UserFormModal user={user(2, "b@test.local", "USER")} onClose={() => {}} />);
    expect(await screen.findByRole("combobox")).toBeEnabled();
  });
});

describe("errorMessage", () => {
  it("explains a refused self role change", () => {
    expect(errorMessage(new ApiError(409, "CANNOT_CHANGE_OWN_ROLE", "x"))).toBe(
      "Bạn không thể đổi vai trò của chính mình.",
    );
  });
});

describe("UserList filters", () => {
  it("puts the search in the URL and links each user to their page", async () => {
    renderAdmin(<UserList />);
    expect(await screen.findByRole("link", { name: "b@test.local" })).toHaveAttribute("href", "/admin/users/2");
    await userEvent.type(screen.getByPlaceholderText("Email, họ tên hoặc SĐT"), "an{Enter}");
    expect(nav.push).toHaveBeenCalledWith("/admin/users?q=an");
  });
});

describe("UserDetail", () => {
  it("shows the profile and asks for this customer's orders", async () => {
    renderAdmin(<UserDetail id={2} />);
    expect(await screen.findByRole("heading", { name: "User 2" })).toBeInTheDocument();
    expect(await screen.findByText("Không có đơn hàng")).toBeInTheDocument();
    const url = fetchMock.mock.calls
      .map(([i]) => new URL((i as Request).url))
      .find((u) => u.pathname === "/api/v1/admin/orders");
    expect(url?.searchParams.get("userId")).toBe("2");
  });
});
