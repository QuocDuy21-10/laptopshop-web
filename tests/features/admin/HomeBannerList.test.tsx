import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { HomeBannerList } from "@/features/admin/home-banners/HomeBannerList";
import { json, mockFetch, renderAdmin } from "../../utils";

const nav = vi.hoisted(() => ({ push: vi.fn(), search: "" }));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: nav.push, replace: nav.push }),
  usePathname: () => "/admin/home-banners",
  useSearchParams: () => new URLSearchParams(nav.search),
}));

const banner = (id: number, over: Record<string, unknown> = {}) => ({
  id,
  placement: "HERO",
  eyebrow: null,
  title: `Banner ${id}`,
  highlight: null,
  description: null,
  ctaText: null,
  linkUrl: null,
  secondaryCtaText: null,
  secondaryLinkUrl: null,
  badges: [],
  imageUrl: null,
  imageAlt: null,
  position: id,
  isActive: true,
  startsAt: null,
  endsAt: null,
  status: "ACTIVE",
  createdAt: "2026-10-01T00:00:00.000Z",
  updatedAt: "2026-10-01T00:00:00.000Z",
  ...over,
});

let fetchMock: ReturnType<typeof mockFetch>;
beforeEach(() => {
  nav.search = "";
  nav.push.mockClear();
  fetchMock = mockFetch();
  fetchMock.mockImplementation(async (input) => {
    const request = input as Request;
    if (request.method === "DELETE") return json(204);
    if (request.method === "PATCH") return json(200, { data: banner(5, { isActive: false, status: "INACTIVE" }) });
    return json(200, {
      data: [
        banner(5),
        banner(6, { isActive: false, status: "INACTIVE" }),
        banner(7, { status: "SCHEDULED" }),
        banner(8, { status: "EXPIRED" }),
      ],
    });
  });
});

const requests = () => fetchMock.mock.calls.map(([i]) => i as Request);
const listUrl = () =>
  requests()
    .map((r) => new URL(r.url))
    .find((u) => u.pathname === "/api/v1/admin/home-banners");

describe("HomeBannerList", () => {
  it("lists hero banners with Vietnamese status labels", async () => {
    renderAdmin(<HomeBannerList />);
    expect(await screen.findByText("Banner 5")).toBeInTheDocument();
    expect(screen.getByText("Đang hiển thị")).toBeInTheDocument();
    expect(screen.getByText("Đang tắt")).toBeInTheDocument();
    expect(screen.getByText("Hẹn giờ")).toBeInTheDocument();
    expect(screen.getByText("Hết hạn")).toBeInTheDocument();
    expect(listUrl()?.searchParams.get("placement")).toBe("HERO");
    expect(screen.queryByText("ACTIVE")).not.toBeInTheDocument();
  });

  it("asks the API for side cards when the URL says so", async () => {
    nav.search = "placement=SIDE";
    renderAdmin(<HomeBannerList />);
    await screen.findByText("Banner 5");
    expect(listUrl()?.searchParams.get("placement")).toBe("SIDE");
  });

  it("puts the selected tab in the URL", async () => {
    renderAdmin(<HomeBannerList />);
    await screen.findByText("Banner 5");
    await userEvent.click(screen.getByRole("tab", { name: "Thẻ ưu đãi" }));
    expect(nav.push).toHaveBeenCalledWith("/admin/home-banners?placement=SIDE");
  });

  it("switches a banner off with a PATCH", async () => {
    renderAdmin(<HomeBannerList />);
    await userEvent.click(await screen.findByRole("switch", { name: "Hiển thị: Banner 5" }));
    await waitFor(() => expect(requests().some((r) => r.method === "PATCH")).toBe(true));
    const patch = requests().find((r) => r.method === "PATCH")!;
    expect(new URL(patch.url).pathname).toBe("/api/v1/admin/home-banners/5");
    expect(await patch.clone().json()).toEqual({ isActive: false });
  });

  it("deletes only after confirmation", async () => {
    renderAdmin(<HomeBannerList />);
    await screen.findByText("Banner 5");
    await userEvent.click(screen.getAllByRole("button", { name: "Xoá" })[0]);
    expect(requests().some((r) => r.method === "DELETE")).toBe(false);
    await userEvent.click(await screen.findByRole("button", { name: "Xác nhận xoá" }));
    await waitFor(() => expect(requests().some((r) => r.method === "DELETE")).toBe(true));
    expect(new URL(requests().find((r) => r.method === "DELETE")!.url).pathname).toBe("/api/v1/admin/home-banners/5");
  });

  it("shows an error when loading fails", async () => {
    fetchMock.mockImplementation(async () => json(500, { error: { code: "INTERNAL_ERROR", message: "x" } }));
    renderAdmin(<HomeBannerList />);
    expect(await screen.findByRole("alert")).toBeInTheDocument();
  });

  it("shows an honest empty state", async () => {
    fetchMock.mockImplementation(async () => json(200, { data: [] }));
    renderAdmin(<HomeBannerList />);
    expect(await screen.findByText("Chưa có banner nào")).toBeInTheDocument();
  });
});
