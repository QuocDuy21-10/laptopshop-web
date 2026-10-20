import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { useAdjustStock } from "@/features/admin/inventory/hooks";
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

describe("inventory hooks", () => {
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
