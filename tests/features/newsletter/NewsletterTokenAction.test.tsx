import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import { NewsletterTokenAction } from "@/features/newsletter/NewsletterTokenAction/NewsletterTokenAction";
import { json, lastRequest, mockFetch, renderWithQuery } from "../../utils";

let fetchMock: ReturnType<typeof mockFetch>;
beforeEach(() => {
  fetchMock = mockFetch();
});

describe("NewsletterTokenAction", () => {
  it("does not call the API until the button is pressed", async () => {
    renderWithQuery(<NewsletterTokenAction action="confirm" token="abc" />);
    expect(screen.getByRole("button", { name: "Xác nhận đăng ký" })).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("confirms with the token from the link", async () => {
    fetchMock.mockResolvedValue(json(200, { data: { status: "CONFIRMED" } }));
    renderWithQuery(<NewsletterTokenAction action="confirm" token="abc" />);
    await userEvent.click(screen.getByRole("button", { name: "Xác nhận đăng ký" }));
    expect(await screen.findByRole("status")).toHaveTextContent("Đã xác nhận đăng ký");
    const request = lastRequest(fetchMock);
    expect(new URL(request.url).pathname).toBe("/api/v1/newsletter/confirm");
    expect(await request.clone().json()).toEqual({ token: "abc" });
  });

  it("unsubscribes with the token from the link", async () => {
    fetchMock.mockResolvedValue(json(200, { data: { status: "UNSUBSCRIBED" } }));
    renderWithQuery(<NewsletterTokenAction action="unsubscribe" token="7.sig" />);
    await userEvent.click(screen.getByRole("button", { name: "Hủy đăng ký" }));
    expect(await screen.findByRole("status")).toHaveTextContent("Đã hủy đăng ký");
    const request = lastRequest(fetchMock);
    expect(new URL(request.url).pathname).toBe("/api/v1/newsletter/unsubscribe");
    expect(await request.clone().json()).toEqual({ token: "7.sig" });
  });

  it("shows the generic invalid-link message and lets the user retry", async () => {
    fetchMock.mockResolvedValue(json(400, { error: { code: "NEWSLETTER_TOKEN_INVALID", message: "x" } }));
    renderWithQuery(<NewsletterTokenAction action="confirm" token="bad" />);
    await userEvent.click(screen.getByRole("button", { name: "Xác nhận đăng ký" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Liên kết không hợp lệ hoặc đã hết hạn.");
    expect(screen.getByRole("button", { name: "Xác nhận đăng ký" })).toBeEnabled();
  });

  it("shows an error without calling the API when the token is missing", () => {
    renderWithQuery(<NewsletterTokenAction action="unsubscribe" />);
    expect(screen.getByRole("alert")).toHaveTextContent("Liên kết không hợp lệ hoặc đã hết hạn.");
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
