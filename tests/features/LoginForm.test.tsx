import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { LoginForm } from "@/features/auth/LoginForm";
import { savePendingCartIntent } from "@/features/cart/intent";
import { json, lastRequest, mockFetch, renderWithQuery } from "../utils";

const router = vi.hoisted(() => ({ push: vi.fn(), replace: vi.fn(), refresh: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => router }));

let fetchMock: ReturnType<typeof mockFetch>;
beforeEach(() => {
  fetchMock = mockFetch();
  vi.clearAllMocks();
});

const fill = async () => {
  await userEvent.type(screen.getByLabelText(/Email/), "a@b.co");
  await userEvent.type(screen.getByLabelText(/Mật khẩu/), "password1");
  await userEvent.click(screen.getByRole("button", { name: "Đăng nhập" }));
};

describe("LoginForm", () => {
  it("tells guests why they were sent to login after an add-to-cart", async () => {
    savePendingCartIntent({ productId: 3, quantity: 1, goToCart: false });
    renderWithQuery(<LoginForm next="/products" />);
    expect(await screen.findByText("Đăng nhập để thêm sản phẩm vào giỏ hàng.")).toBeInTheDocument();
    window.sessionStorage.clear();
  });

  it("validates before calling the API", async () => {
    renderWithQuery(<LoginForm next="/" />);
    await userEvent.click(screen.getByRole("button", { name: "Đăng nhập" }));
    expect(await screen.findByText("Email không hợp lệ")).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("shows the translated credentials error", async () => {
    fetchMock.mockResolvedValue(json(401, { error: { code: "INVALID_CREDENTIALS", message: "Invalid" } }));
    renderWithQuery(<LoginForm next="/" />);
    await fill();
    expect(await screen.findByRole("alert")).toHaveTextContent("Email hoặc mật khẩu không đúng.");
    expect(router.replace).not.toHaveBeenCalled();
  });

  it("flags the inputs, clears and refocuses the password, and dismisses the error on typing", async () => {
    fetchMock.mockResolvedValue(json(401, { error: { code: "INVALID_CREDENTIALS", message: "Invalid" } }));
    renderWithQuery(<LoginForm next="/" />);
    await fill();
    await screen.findByRole("alert");
    const password = screen.getByLabelText(/Mật khẩu/);
    expect(screen.getByLabelText(/Email/)).toHaveAttribute("aria-invalid", "true");
    expect(password).toHaveAttribute("aria-invalid", "true");
    await waitFor(() => expect(password).toHaveFocus());
    expect(password).toHaveValue("");

    await userEvent.type(password, "x");
    await waitFor(() => expect(screen.queryByRole("alert")).not.toBeInTheDocument());
    expect(password).not.toHaveAttribute("aria-invalid");
  });

  it("keeps the password when the failure is not a credentials error", async () => {
    fetchMock.mockResolvedValue(json(500, { error: { code: "INTERNAL", message: "boom" } }));
    renderWithQuery(<LoginForm next="/" />);
    await fill();
    await screen.findByRole("alert");
    expect(screen.getByLabelText(/Mật khẩu/)).toHaveValue("password1");
  });

  it("logs in and goes to the next page", async () => {
    fetchMock.mockResolvedValue(json(200, { data: { user: { id: 1 } } }));
    renderWithQuery(<LoginForm next="/checkout" />);
    await fill();
    await waitFor(() => expect(router.replace).toHaveBeenCalledWith("/checkout"));
    const request = lastRequest(fetchMock);
    expect(new URL(request.url).pathname).toBe("/api/v1/auth/login");
    expect(await request.json()).toEqual({ username: "a@b.co", password: "password1" });
  });
});
