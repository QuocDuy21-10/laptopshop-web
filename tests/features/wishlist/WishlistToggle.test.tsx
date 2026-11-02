import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { WishlistToggle } from "@/features/wishlist/WishlistToggle/WishlistToggle";
import { AuthPromptProvider } from "@/features/auth/AuthPrompt/AuthPromptProvider";
import { renderWithQuery } from "../../utils";

const toastError = vi.hoisted(() => vi.fn());
vi.mock("sonner", () => ({ toast: { error: toastError, success: vi.fn() } }));

const mocks = vi.hoisted(() => ({
  me: vi.fn(),
  status: vi.fn(),
  add: vi.fn(),
  remove: vi.fn(),
  push: vi.fn(),
}));

vi.mock("@/features/account/useMe", () => ({ useMe: mocks.me }));
vi.mock("@/features/wishlist/hooks", () => ({
  useWishlistStatus: mocks.status,
  useAddWishlistItem: () => ({ mutate: mocks.add, isPending: false }),
  useRemoveWishlistItem: () => ({ mutate: mocks.remove, isPending: false }),
}));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mocks.push }),
  usePathname: () => "/products",
}));

beforeEach(() => {
  vi.clearAllMocks();
  window.history.replaceState({}, "", "/products?q=dell");
  mocks.me.mockReturnValue({ data: { id: 7 }, isPending: false });
  mocks.status.mockReturnValue({ data: [{ productId: 3, isWishlisted: false }], isPending: false });
});

describe("WishlistToggle", () => {
  it("renders an accessible unpressed heart and adds for authenticated users", async () => {
    renderWithQuery(<WishlistToggle productId={3} productName="Dell XPS" />);
    const button = screen.getByRole("button", { name: "Thêm Dell XPS vào danh sách yêu thích" });
    expect(button).toHaveAttribute("aria-pressed", "false");
    expect(button.className).toContain("touchTarget");
    await userEvent.click(button);
    expect(mocks.add).toHaveBeenCalledWith(3, expect.objectContaining({ onError: expect.any(Function) }));
  });

  it("removes an authenticated wishlisted product", async () => {
    mocks.status.mockReturnValue({ data: [{ productId: 3, isWishlisted: true }], isPending: false });
    renderWithQuery(<WishlistToggle productId={3} productName="Dell XPS" />);
    const button = screen.getByRole("button", { name: "Bỏ Dell XPS khỏi danh sách yêu thích" });
    expect(button).toHaveAttribute("aria-pressed", "true");
    await userEvent.click(button);
    expect(mocks.remove).toHaveBeenCalledWith(3, expect.objectContaining({ onError: expect.any(Function) }));
  });

  it("stores a guest intent and asks to sign in with the current path", async () => {
    mocks.me.mockReturnValue({ data: null, isPending: false });
    // a disabled query reports isPending=true forever, but isLoading=false
    mocks.status.mockReturnValue({ data: undefined, isPending: true, isLoading: false });
    renderWithQuery(<AuthPromptProvider><WishlistToggle productId={3} productName="Dell XPS" /></AuthPromptProvider>);
    await userEvent.click(screen.getByRole("button", { name: "Thêm Dell XPS vào danh sách yêu thích" }));
    expect(await screen.findByText("Đăng nhập để lưu sản phẩm yêu thích")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Đăng nhập" })).toHaveAttribute("href", "/login?next=%2Fproducts%3Fq%3Ddell");
    expect(JSON.parse(window.sessionStorage.getItem("laptopshop.wishlist.intent")!)).toMatchObject({ productId: 3 });
    expect(mocks.add).not.toHaveBeenCalled();
  });

  it("tells the user why a failed add was rolled back", async () => {
    const { ApiError } = await import("@/lib/api/errors");
    mocks.add.mockImplementation((_id: number, options: { onError: (e: unknown) => void }) =>
      options.onError(new ApiError(409, "WISHLIST_LIMIT_REACHED", "limit")),
    );
    renderWithQuery(<WishlistToggle productId={3} productName="Dell XPS" />);
    await userEvent.click(screen.getByRole("button", { name: "Thêm Dell XPS vào danh sách yêu thích" }));
    expect(toastError).toHaveBeenCalledWith("Danh sách yêu thích đã đạt giới hạn 100 sản phẩm.");
  });

  it("reports a failed removal", async () => {
    const { ApiError } = await import("@/lib/api/errors");
    mocks.status.mockReturnValue({ data: [{ productId: 3, isWishlisted: true }], isPending: false });
    mocks.remove.mockImplementation((_id: number, options: { onError: (e: unknown) => void }) =>
      options.onError(new ApiError(503, "SERVICE_UNAVAILABLE", "down")),
    );
    renderWithQuery(<WishlistToggle productId={3} productName="Dell XPS" />);
    await userEvent.click(screen.getByRole("button", { name: "Bỏ Dell XPS khỏi danh sách yêu thích" }));
    expect(toastError).toHaveBeenCalledWith("Máy chủ đang gặp sự cố. Vui lòng thử lại sau.");
  });
});
