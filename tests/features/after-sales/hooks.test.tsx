import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, beforeEach } from "vitest";
import { useCreateAfterSalesRequest } from "@/features/after-sales/hooks";
import { json, lastRequest, mockFetch, renderWithQuery } from "../../utils";

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
});
