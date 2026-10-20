import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { StockAdjustModal } from "@/features/admin/inventory/StockAdjustModal";
import { json, lastRequest, mockFetch, renderAdmin } from "../../utils";

const product = {
  id: 1,
  name: "Dell XPS",
  price: 100,
  image: null,
  detailDesc: "d",
  shortDesc: "s",
  quantity: 3,
  sold: 0,
  factory: "DELL",
  target: "GAMING",
  isActive: true,
  cpu: null,
  gpu: null,
  ramGb: null,
  storageGb: null,
  screenSizeInch: null,
  screenResolution: null,
  refreshRateHz: null,
  batteryWh: null,
  weightGrams: null,
  warrantyMonths: null,
};

let fetchMock: ReturnType<typeof mockFetch>;
beforeEach(() => {
  fetchMock = mockFetch();
  fetchMock.mockResolvedValue(
    json(201, { data: { product: { ...product, quantity: 8 }, movement: {} } }),
  );
});

describe("StockAdjustModal", () => {
  it("restocks and shows the stock after the change", async () => {
    const onClose = vi.fn();
    renderAdmin(<StockAdjustModal product={product} onClose={onClose} />);
    await userEvent.type(screen.getByLabelText("Số lượng thay đổi"), "5");
    expect(screen.getByText("Tồn kho: 3 → 8")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Xác nhận" }));
    await waitFor(() => expect(onClose).toHaveBeenCalled());
    const req = lastRequest(fetchMock);
    expect(new URL(req.url).pathname).toBe("/api/v1/admin/inventory/adjustments");
    expect(await req.json()).toEqual({ productId: 1, delta: 5, reason: "RESTOCK", note: "" });
  });

  it("requires a note for a correction", async () => {
    renderAdmin(<StockAdjustModal product={product} onClose={() => {}} />);
    await userEvent.click(screen.getByText("Điều chỉnh kiểm kê"));
    await userEvent.type(screen.getByLabelText("Số lượng thay đổi"), "-1");
    await userEvent.click(screen.getByRole("button", { name: "Xác nhận" }));
    expect(await screen.findByText("Nhập lý do điều chỉnh")).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
