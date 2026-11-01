import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { HomeBannerForm } from "@/features/admin/home-banners/HomeBannerForm";
import type { AdminHomeBanner } from "@/lib/api/types";
import { json, mockFetch, renderAdmin } from "../../utils";

const nav = vi.hoisted(() => ({ push: vi.fn(), replace: vi.fn() }));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: nav.push, replace: nav.replace }),
  usePathname: () => "/admin/home-banners/new",
  useSearchParams: () => new URLSearchParams(),
}));

const banner = (over: Partial<AdminHomeBanner> = {}): AdminHomeBanner => ({
  id: 5,
  placement: "HERO",
  eyebrow: null,
  title: "Gaming 2026",
  highlight: null,
  description: null,
  ctaText: "Xem ngay",
  linkUrl: "/products",
  secondaryCtaText: null,
  secondaryLinkUrl: null,
  badges: [],
  imageUrl: null,
  imageAlt: null,
  position: 0,
  isActive: false,
  startsAt: null,
  endsAt: null,
  status: "INACTIVE",
  createdAt: "2026-10-01T00:00:00.000Z",
  updatedAt: "2026-10-01T00:00:00.000Z",
  ...over,
});

let fetchMock: ReturnType<typeof mockFetch>;
const requests = () => fetchMock.mock.calls.map(([i]) => i as Request);
const byMethod = (method: string) => requests().filter((r) => r.method === method);

beforeEach(() => {
  nav.push.mockClear();
  nav.replace.mockClear();
  fetchMock = mockFetch();
  fetchMock.mockImplementation(async (input) => {
    const request = input as Request;
    const created = request.method === "POST" && !request.url.endsWith("/image");
    return json(created ? 201 : 200, { data: banner() });
  });
});

const fileInput = (container: HTMLElement) => container.querySelector('input[type="file"]') as HTMLInputElement;
const png = () => new File(["png"], "hero.png", { type: "image/png" });

describe("HomeBannerForm", () => {
  it("shows hero-only fields for HERO and hides them for a side card", async () => {
    renderAdmin(<HomeBannerForm />);
    expect(screen.getByLabelText("Chữ nút chính")).toBeInTheDocument();
    expect(screen.getByText("Nhãn nổi trên ảnh")).toBeInTheDocument();
    await userEvent.click(screen.getByText("Thẻ ưu đãi"));
    expect(screen.queryByLabelText("Chữ nút chính")).not.toBeInTheDocument();
    expect(screen.queryByText("Nhãn nổi trên ảnh")).not.toBeInTheDocument();
  });

  it("creates a banner without an image: one POST, no upload", async () => {
    renderAdmin(<HomeBannerForm />);
    await userEvent.type(screen.getByLabelText("Tiêu đề"), "Gaming 2026");
    await userEvent.click(screen.getByRole("button", { name: "Tạo banner" }));
    await waitFor(() => expect(nav.push).toHaveBeenCalledWith("/admin/home-banners?placement=HERO"));
    const posts = byMethod("POST");
    expect(posts).toHaveLength(1);
    expect(new URL(posts[0].url).pathname).toBe("/api/v1/admin/home-banners");
    expect(await posts[0].clone().json()).toMatchObject({
      placement: "HERO",
      title: "Gaming 2026",
      isActive: false,
      badges: [],
      position: 0,
    });
  });

  it("uploads the picked image with its alt text after saving", async () => {
    const { container } = renderAdmin(<HomeBannerForm />);
    await userEvent.type(screen.getByLabelText("Tiêu đề"), "Gaming 2026");
    await userEvent.upload(fileInput(container), png());
    await userEvent.type(screen.getByLabelText("Mô tả ảnh"), "Laptop gaming");
    await userEvent.click(screen.getByRole("button", { name: "Tạo banner" }));
    await waitFor(() => expect(nav.push).toHaveBeenCalled());
    const posts = byMethod("POST");
    expect(posts.map((r) => new URL(r.url).pathname)).toEqual([
      "/api/v1/admin/home-banners",
      "/api/v1/admin/home-banners/5/image",
    ]);
    const form = await posts[1].formData();
    expect(form.get("imageAlt")).toBe("Laptop gaming");
    expect((form.get("image") as Blob).size).toBe(3);
  });

  it("requires alt text when an image is picked and sends nothing", async () => {
    const { container } = renderAdmin(<HomeBannerForm />);
    await userEvent.type(screen.getByLabelText("Tiêu đề"), "Gaming 2026");
    await userEvent.upload(fileInput(container), png());
    await userEvent.click(screen.getByRole("button", { name: "Tạo banner" }));
    expect(await screen.findByText("Nhập mô tả ảnh")).toBeInTheDocument();
    expect(byMethod("POST")).toHaveLength(0);
  });

  it("blocks an unsafe link without calling the API", async () => {
    renderAdmin(<HomeBannerForm />);
    await userEvent.type(screen.getByLabelText("Tiêu đề"), "Gaming 2026");
    await userEvent.type(screen.getByLabelText("Chữ nút chính"), "Xem");
    await userEvent.type(screen.getByLabelText("Đường dẫn nút chính"), "javascript:alert(1)");
    await userEvent.click(screen.getByRole("button", { name: "Tạo banner" }));
    expect(await screen.findByText("Chỉ nhận đường dẫn bắt đầu bằng / hoặc https://")).toBeInTheDocument();
    expect(byMethod("POST")).toHaveLength(0);
  });

  it("requires the button text and link together", async () => {
    renderAdmin(<HomeBannerForm />);
    await userEvent.type(screen.getByLabelText("Tiêu đề"), "Gaming 2026");
    await userEvent.type(screen.getByLabelText("Chữ nút chính"), "Xem");
    await userEvent.click(screen.getByRole("button", { name: "Tạo banner" }));
    expect(await screen.findAllByText("Nhập đủ chữ nút và đường dẫn, hoặc để trống cả hai")).not.toHaveLength(0);
    expect(byMethod("POST")).toHaveLength(0);
  });

  it("shows the API error and stays on the page", async () => {
    fetchMock.mockImplementation(async () =>
      json(400, { error: { code: "VALIDATION_ERROR", message: "Validation failed", details: [{ path: "title", message: "x" }] } }),
    );
    renderAdmin(<HomeBannerForm />);
    await userEvent.type(screen.getByLabelText("Tiêu đề"), "Gaming 2026");
    await userEvent.click(screen.getByRole("button", { name: "Tạo banner" }));
    expect(await screen.findByText("Vui lòng kiểm tra lại thông tin đã nhập.")).toBeInTheDocument();
    expect(nav.push).not.toHaveBeenCalled();
  });

  it("edits with PATCH, keeps the placement fixed and never sends it", async () => {
    renderAdmin(<HomeBannerForm banner={banner()} />);
    expect(screen.getByLabelText("Tiêu đề")).toHaveValue("Gaming 2026");
    expect(screen.queryByText("Thẻ ưu đãi")).not.toBeInTheDocument();
    await userEvent.clear(screen.getByLabelText("Tiêu đề"));
    await userEvent.type(screen.getByLabelText("Tiêu đề"), "Gaming 2027");
    await userEvent.click(screen.getByRole("button", { name: "Lưu banner" }));
    await waitFor(() => expect(nav.push).toHaveBeenCalledWith("/admin/home-banners?placement=HERO"));
    const patch = byMethod("PATCH")[0];
    expect(new URL(patch.url).pathname).toBe("/api/v1/admin/home-banners/5");
    const body = await patch.clone().json();
    expect(body.title).toBe("Gaming 2027");
    expect(body).toMatchObject({ ctaText: "Xem ngay", linkUrl: "/products", badges: [] });
    expect(body).not.toHaveProperty("placement");
  });

  it("removes an existing image after confirmation", async () => {
    renderAdmin(<HomeBannerForm banner={banner({ imageUrl: "/images/banner/a.png", imageAlt: "Cũ" })} />);
    await userEvent.click(screen.getByRole("button", { name: "Xoá ảnh" }));
    await userEvent.click(await screen.findByRole("button", { name: "Xác nhận xoá" }));
    await waitFor(() => expect(byMethod("DELETE")).toHaveLength(1));
    expect(new URL(byMethod("DELETE")[0].url).pathname).toBe("/api/v1/admin/home-banners/5/image");
  });
});
