import { describe, expect, it, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { json, lastRequest, mockFetch, renderWithQuery, urlOf } from "../../utils";
import { useAllAfterSalesDevices, useCreateAfterSalesRequest } from "@/features/after-sales/hooks";

beforeEach(() => mockFetch());

describe("after-sales hooks", () => {
  it("sends an idempotency key when creating a request", async () => {
    const fetchMock = mockFetch();
    fetchMock.mockResolvedValue(json(201, { data: { id: 1 } }));
    function Harness() {
      const mutation = useCreateAfterSalesRequest();
      return <button onClick={() => mutation.mutate({ type: "TECHNICAL_SUPPORT", subject: "X", items: [{ orderDetailId: 1, deviceLabel: "Máy", issueDescription: "Lỗi" }] })}>Gửi</button>;
    }
    renderWithQuery(<Harness />);
    await userEvent.click(screen.getByRole("button", { name: "Gửi" }));
    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    expect(lastRequest(fetchMock).headers.get("idempotency-key")).toMatch(/.+/);
  });

  it("retries the same request with the same idempotency key until it succeeds", async () => {
    const fetchMock = mockFetch();
    fetchMock.mockRejectedValueOnce(new TypeError("network down")).mockResolvedValue(json(201, { data: { id: 1 } }));
    const body = { type: "TECHNICAL_SUPPORT" as const, subject: "X", items: [{ orderDetailId: 1, deviceLabel: "Máy", issueDescription: "Lỗi" }] };
    function Harness() {
      const mutation = useCreateAfterSalesRequest();
      return <><button onClick={() => mutation.mutate(body)}>Gửi</button><button onClick={() => mutation.mutate({ ...body, subject: "Y" })}>Gửi khác</button></>;
    }
    renderWithQuery(<Harness />);
    await userEvent.click(screen.getByRole("button", { name: "Gửi" }));
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    await userEvent.click(screen.getByRole("button", { name: "Gửi" }));
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    const keys = fetchMock.mock.calls.map(([request]) => (request as Request).headers.get("idempotency-key"));
    expect(keys[0]).toBe(keys[1]);
    await userEvent.click(screen.getByRole("button", { name: "Gửi khác" }));
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(3));
    expect(lastRequest(fetchMock).headers.get("idempotency-key")).not.toBe(keys[0]);
  });

  it("loads every page of eligible devices", async () => {
    const fetchMock = mockFetch();
    fetchMock.mockImplementation(async (input) => {
      const page = Number(new URL(urlOf(input)).searchParams.get("page"));
      return json(200, { data: [{ orderDetailId: page }], meta: { page, pageSize: 50, total: 2, totalPages: 2 } });
    });
    function Harness() {
      const devices = useAllAfterSalesDevices(7, "WARRANTY");
      return <p>{devices.data?.map((device) => device.orderDetailId).join(",") ?? "…"}</p>;
    }
    renderWithQuery(<Harness />);
    expect(await screen.findByText("1,2")).toBeInTheDocument();
  });
});
