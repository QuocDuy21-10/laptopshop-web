import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import { NewsletterForm } from "@/features/newsletter/NewsletterForm/NewsletterForm";
import { json, lastRequest, mockFetch, renderWithQuery } from "../../utils";

let fetchMock: ReturnType<typeof mockFetch>;
beforeEach(() => {
  fetchMock = mockFetch();
});

const submit = async (email = "khach@example.com") => {
  await userEvent.type(screen.getByLabelText(/Email/), email);
  await userEvent.click(screen.getByRole("button", { name: "Đăng ký" }));
};

describe("NewsletterForm", () => {
  it("validates the email before calling the API", async () => {
    renderWithQuery(<NewsletterForm />);
    await submit("không-phải-email");
    expect(await screen.findByText("Email không hợp lệ")).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("posts the trimmed email and shows a neutral message that does not reveal subscription state", async () => {
    fetchMock.mockResolvedValue(json(202, { data: { accepted: true } }));
    renderWithQuery(<NewsletterForm />);
    await submit("  khach@example.com ");
    expect(await screen.findByRole("status")).toHaveTextContent(
      "Nếu email hợp lệ, bạn sẽ nhận được thư xác nhận trong ít phút.",
    );
    const request = lastRequest(fetchMock);
    expect(new URL(request.url).pathname).toBe("/api/v1/newsletter/subscribe");
    expect(request.method).toBe("POST");
    expect(await request.clone().json()).toEqual({ email: "khach@example.com" });
    expect(screen.queryByRole("button", { name: "Đăng ký" })).not.toBeInTheDocument();
  });

  it("explains when email delivery is unavailable and keeps the form", async () => {
    fetchMock.mockResolvedValue(json(503, { error: { code: "EMAIL_DELIVERY_UNAVAILABLE", message: "x" } }));
    renderWithQuery(<NewsletterForm />);
    await submit();
    expect(await screen.findByRole("alert")).toHaveTextContent("Hiện chưa gửi được email");
    expect(screen.getByRole("button", { name: "Đăng ký" })).toBeEnabled();
  });

  it("shows a generic message when rate limited", async () => {
    fetchMock.mockResolvedValue(json(429, { message: "Too many requests" }));
    renderWithQuery(<NewsletterForm />);
    await submit();
    expect(await screen.findByRole("alert")).toHaveTextContent("Bạn thao tác quá nhanh");
  });

  it("disables the button while the request is in flight", async () => {
    let release: (value: Response) => void = () => {};
    fetchMock.mockReturnValue(new Promise<Response>((resolve) => (release = resolve)));
    renderWithQuery(<NewsletterForm />);
    await submit();
    await waitFor(() => expect(screen.getByRole("button", { name: "Đăng ký" })).toBeDisabled());
    release(json(202, { data: { accepted: true } }));
    expect(await screen.findByRole("status")).toBeInTheDocument();
  });
});
