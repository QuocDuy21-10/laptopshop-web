import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { UploadFile } from "antd";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ProductForm, toProductFormData } from "@/features/admin/products/ProductForm";
import { renderAdmin } from "../../utils";

const mocks = vi.hoisted(() => ({ push: vi.fn(), mutate: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: mocks.push }) }));
vi.mock("@/features/admin/products/hooks", () => ({
  useProductFilterOptions: () => ({
    data: { factoryOptions: [{ name: "Dell", value: "DELL" }], targetOptions: [{ name: "Doanh nhân", value: "DOANH-NHAN" }] },
  }),
  useSaveProduct: () => ({ mutate: mocks.mutate, isPending: false }),
}));

const PRODUCT = {
  id: 7, name: "Dell XPS", price: 30000000, image: "/images/product/xps.png", detailDesc: "Chi tiết", shortDesc: "Ngắn",
  quantity: 3, sold: 1, factory: "DELL", target: "DOANH-NHAN", isActive: true, cpu: null, gpu: null, ramGb: null, storageGb: null, screenSizeInch: null, screenResolution: null, refreshRateHz: null, batteryWh: null, weightGrams: null, warrantyMonths: null,
};

beforeEach(() => vi.clearAllMocks());

describe("toProductFormData", () => {
  it("sends every field and the picked image file", () => {
    const file = new File(["x"], "a.png", { type: "image/png" });
    const form = toProductFormData({
      name: "A", price: 100, quantity: 0, factory: "DELL", target: "DOANH-NHAN", shortDesc: "s", detailDesc: "d",
      image: [{ uid: "1", name: "a.png", originFileObj: file as UploadFile["originFileObj"] }],
    });
    expect([...form.keys()].sort()).toEqual(
      ["detailDesc", "factory", "image", "name", "price", "quantity", "shortDesc", "target"],
    );
    expect(form.get("quantity")).toBe("0");
    expect((form.get("image") as File).name).toBe("a.png");
  });
});

describe("ProductForm", () => {
  it("validates required fields before sending", async () => {
    renderAdmin(<ProductForm />);
    await userEvent.click(screen.getByRole("button", { name: "Thêm sản phẩm" }));
    expect(await screen.findByText("Nhập tên sản phẩm")).toBeInTheDocument();
    expect(mocks.mutate).not.toHaveBeenCalled();
  });

  it("saves an edited product without re-sending the image", async () => {
    renderAdmin(<ProductForm product={PRODUCT} />);
    await userEvent.click(screen.getByRole("button", { name: "Lưu thay đổi" }));
    await waitFor(() => expect(mocks.mutate).toHaveBeenCalled());
    const form = mocks.mutate.mock.calls[0][0] as FormData;
    expect(form.get("name")).toBe("Dell XPS");
    expect(form.get("price")).toBe("30000000");
    expect(form.get("factory")).toBe("DELL");
    expect(form.has("image")).toBe(false);
  });

  it("shows stock read-only when editing and does not send it", async () => {
    renderAdmin(<ProductForm product={PRODUCT} />);
    expect(screen.getByRole("button", { name: "Điều chỉnh kho" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Xem nhật ký kho" })).toHaveAttribute("href", "/admin/inventory?productId=7");
    await userEvent.click(screen.getByRole("button", { name: "Lưu thay đổi" }));
    await waitFor(() => expect(mocks.mutate).toHaveBeenCalled());
    expect((mocks.mutate.mock.calls[0][0] as FormData).has("quantity")).toBe(false);
  });
});
