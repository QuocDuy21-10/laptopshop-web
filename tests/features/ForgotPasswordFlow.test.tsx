import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ForgotPasswordFlow } from "@/features/auth/ForgotPasswordFlow";
import { json, lastRequest, mockFetch, renderWithQuery, urlOf } from "../utils";

const router = vi.hoisted(() => ({ replace: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => router }));

let fetchMock: ReturnType<typeof mockFetch>;
beforeEach(() => {
  fetchMock = mockFetch();
  vi.clearAllMocks();
});

const requestCode = async () => {
  await userEvent.type(screen.getByLabelText(/Email/), "a@b.co");
  await userEvent.click(screen.getByRole("button", { name: "Gửi mã" }));
};

describe("ForgotPasswordFlow", () => {
  it("validates the email before calling the API", async () => {
    renderWithQuery(<ForgotPasswordFlow />);
    await userEvent.click(screen.getByRole("button", { name: "Gửi mã" }));
    expect(await screen.findByText("Email không hợp lệ")).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("explains when email delivery is unavailable", async () => {
    fetchMock.mockResolvedValue(json(503, { error: { code: "EMAIL_DELIVERY_UNAVAILABLE", message: "x" } }));
    renderWithQuery(<ForgotPasswordFlow />);
    await requestCode();
    expect(await screen.findByRole("alert")).toHaveTextContent("Hiện chưa gửi được email");
  });

  it("moves to the code step without putting the email in the URL, then resets and goes to login", async () => {
    fetchMock.mockResolvedValue(json(202, { data: { accepted: true } }));
    renderWithQuery(<ForgotPasswordFlow />);
    await requestCode();
    expect(await screen.findByLabelText(/Mã xác nhận/)).toBeInTheDocument();
    expect(window.location.search).toBe("");

    fetchMock.mockResolvedValue(json(200, { data: { reset: true } }));
    await userEvent.type(screen.getByLabelText(/Mã xác nhận/), "123456");
    await userEvent.type(screen.getByLabelText(/^Mật khẩu mới/), "newpassword1");
    await userEvent.type(screen.getByLabelText(/^Nhập lại mật khẩu mới/), "newpassword1");
    await userEvent.click(screen.getByRole("button", { name: "Đặt lại mật khẩu" }));
    await waitFor(() => expect(router.replace).toHaveBeenCalledWith("/login?reset=1"));
    const req = lastRequest(fetchMock);
    expect(urlOf(req)).toContain("/api/v1/auth/reset-password");
    expect(await req.clone().json()).toMatchObject({ username: "a@b.co", code: "123456", password: "newpassword1" });
  });

  it("shows a wrong code on the code field", async () => {
    fetchMock.mockResolvedValue(json(202, { data: { accepted: true } }));
    renderWithQuery(<ForgotPasswordFlow />);
    await requestCode();
    fetchMock.mockResolvedValue(json(400, { error: { code: "PASSWORD_RESET_CODE_INVALID", message: "x" } }));
    await userEvent.type(await screen.findByLabelText(/Mã xác nhận/), "000000");
    await userEvent.type(screen.getByLabelText(/^Mật khẩu mới/), "newpassword1");
    await userEvent.type(screen.getByLabelText(/^Nhập lại mật khẩu mới/), "newpassword1");
    await userEvent.click(screen.getByRole("button", { name: "Đặt lại mật khẩu" }));
    expect(await screen.findByText("Mã không đúng hoặc đã hết hạn.")).toBeInTheDocument();
    expect(router.replace).not.toHaveBeenCalled();
  });
});
