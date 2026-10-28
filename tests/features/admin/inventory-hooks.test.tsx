import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { useAdjustStock, usePostReceipt } from "@/features/admin/inventory/hooks";
import { json, lastRequest, mockFetch, renderWithQuery } from "../../utils";

function Harness() {
  const adjust = useAdjustStock();
  return (
    <button
      onClick={() =>
        adjust.mutate({
          body: { productId: 1, delta: 5, reason: "RESTOCK", note: "Nhập" },
          idempotencyKey: "key-1",
        })
      }
    >
      Gửi
    </button>
  );
}

function PostHarness() {
  const post = usePostReceipt("00000000-0000-4000-8000-000000000001");
  return <button onClick={() => post.mutate(3)}>Xác nhận</button>;
}

describe("inventory hooks", () => {
  it("posts a receipt with the version the admin saw", async () => {
    const fetchMock = mockFetch();
    fetchMock.mockResolvedValue(json(200, { data: { created: true } }));
    renderWithQuery(<PostHarness />);
    await userEvent.click(screen.getByRole("button", { name: "Xác nhận" }));
    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    expect(await lastRequest(fetchMock).json()).toEqual({ version: 3 });
  });

  it("sends idempotency key as a header, not in the body", async () => {
    const fetchMock = mockFetch();
    fetchMock.mockResolvedValue(json(201, { data: { created: true } }));
    renderWithQuery(<Harness />);
    await userEvent.click(screen.getByRole("button", { name: "Gửi" }));
    const request = lastRequest(fetchMock);
    expect(request.headers.get("Idempotency-Key")).toBe("key-1");
    expect(await request.json()).not.toHaveProperty("idempotencyKey");
  });
});
