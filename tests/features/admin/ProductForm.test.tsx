import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { UploadFile } from "antd";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ProductForm, toProductFormData, toProductPatchFormData } from "@/features/admin/products/ProductForm";
import { renderAdmin } from "../../utils";

const mocks = vi.hoisted(() => ({ push: vi.fn(), mutate: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: mocks.push }) }));
vi.mock("@/features/admin/products/hooks", () => ({
  useProductFilterOptions: () => ({
    data: {
      factoryOptions: [{ name: "Dell", value: "DELL" }],
      targetOptions: [{ name: "Doanh nhân", value: "DOANH-NHAN" }],
      facetDefinitions: [
        { key: "cpuBrand", name: "CPU", mode: "MULTI", kind: "categorical", options: [{ name: "Intel", value: "INTEL" }] },
        { key: "gpuBrand", name: "Hãng GPU", mode: "MULTI", kind: "categorical", options: [{ name: "NVIDIA", value: "NVIDIA" }] },
        { key: "gpuType", name: "Loại GPU", mode: "MULTI", kind: "categorical", options: [{ name: "Rời", value: "DEDICATED" }] },
        { key: "panelType", name: "Loại tấm nền", mode: "MULTI", kind: "categorical", options: [{ name: "IPS", value: "IPS" }] },
      ],
    },
  }),
  useSaveProduct: () => ({ mutate: mocks.mutate, isPending: false }),
}));

const PRODUCT = {
  id: 7, name: "Dell XPS", price: 30000000, image: "/images/product/xps.png", detailDesc: "Chi tiết", shortDesc: "Ngắn",
  quantity: 3, sold: 1, factory: "DELL", target: "DOANH-NHAN", isActive: true, cpu: null, cpuBrand: null, gpu: null, gpuBrand: null, gpuType: null, ramGb: null, storageGb: null, screenSizeInch: null, screenResolution: null, resolutionTier: null, panelType: null, refreshRateHz: null, batteryWh: null, weightGrams: null, warrantyMonths: null,
};

beforeEach(() => vi.clearAllMocks());

describe("toProductFormData", () => {
  it("sends every field and the picked image file", () => {
    const file = new File(["x"], "a.png", { type: "image/png" });
    const form = toProductFormData({
      name: "A", price: 100, quantity: 0, factory: "DELL", target: "DOANH-NHAN", shortDesc: "s", detailDesc: "d",
      image: [{ uid: "1", name: "a.png", originFileObj: file as UploadFile["originFileObj"] }],
    });
    expect([...form.keys()].sort()).toEqual([
      "batteryWh", "cpu", "cpuBrand", "detailDesc", "factory", "gpu", "gpuBrand", "gpuType", "image", "name", "panelType", "price", "quantity",
      "ramGb", "refreshRateHz", "screenResolution", "screenSizeInch", "shortDesc", "storageGb",
      "target", "warrantyMonths", "weightGrams",
    ]);
    expect(form.get("quantity")).toBe("0");
    expect((form.get("image") as File).name).toBe("a.png");
  });

  it("sends specs, trimming text and blanking empty ones so the API clears them", () => {
    const form = toProductFormData({
      name: "A", price: 100, factory: "DELL", target: "DOANH-NHAN", shortDesc: "s", detailDesc: "d",
      cpu: " Intel Core i5 ", cpuBrand: "INTEL", ramGb: 16, screenSizeInch: 15.6, gpu: null, gpuBrand: null, gpuType: null, batteryWh: undefined,
    });
    expect(form.get("cpu")).toBe("Intel Core i5");
    expect(form.get("cpuBrand")).toBe("INTEL");
    expect(form.get("ramGb")).toBe("16");
    expect(form.get("gpuBrand")).toBe("");
    expect(form.get("gpuType")).toBe("");
    expect(form.get("screenSizeInch")).toBe("15.6");
    expect(form.get("gpu")).toBe("");
    expect(form.get("batteryWh")).toBe("");
  });
});

describe("toProductPatchFormData", () => {
  it("sends only touched fields and preserves explicit clears", () => {
    const form = toProductPatchFormData(
      {
        name: "A", price: 200, factory: "DELL", target: "DOANH-NHAN", shortDesc: "s", detailDesc: "d",
        cpu: "Intel Core i5", cpuBrand: "INTEL", ramGb: null,
      },
      { price: true, ramGb: true },
    );
    expect([...form.keys()].sort()).toEqual(["price", "ramGb"]);
    expect(form.get("price")).toBe("200");
    expect(form.get("ramGb")).toBe("");
    expect(form.has("cpu")).toBe(false);
    expect(form.has("cpuBrand")).toBe(false);
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
    await userEvent.clear(screen.getByLabelText("Giá (₫)"));
    await userEvent.type(screen.getByLabelText("Giá (₫)"), "30000000");
    await userEvent.click(screen.getByRole("button", { name: "Lưu thay đổi" }));
    await waitFor(() => expect(mocks.mutate).toHaveBeenCalled());
    const form = mocks.mutate.mock.calls[0][0] as FormData;
    expect(form.get("name")).toBe(null);
    expect(form.get("price")).toBe("30000000");
    expect(form.get("factory")).toBe(null);
    expect(form.has("image")).toBe(false);
  });

  it("loads stored specs and sends a cleared one as empty", async () => {
    renderAdmin(<ProductForm product={{ ...PRODUCT, cpu: "Intel Core i7", cpuBrand: "INTEL", ramGb: 16, resolutionTier: "FHD" }} />);
    expect(screen.getByLabelText("CPU")).toHaveValue("Intel Core i7");
    expect(screen.getByText("FHD")).toBeInTheDocument();
    await userEvent.clear(screen.getByLabelText("RAM (GB)"));
    await userEvent.click(screen.getByRole("button", { name: "Lưu thay đổi" }));
    await waitFor(() => expect(mocks.mutate).toHaveBeenCalled());
    const form = mocks.mutate.mock.calls[0][0] as FormData;
    expect(form.get("cpu")).toBe(null);
    expect(form.get("ramGb")).toBe("");
  });

  it("clears dependent GPU facets when the GPU text is cleared", async () => {
    renderAdmin(<ProductForm product={{ ...PRODUCT, gpu: "RTX 4060", gpuBrand: "NVIDIA", gpuType: "DEDICATED" }} />);
    await userEvent.clear(screen.getByLabelText("Card đồ hoạ"));
    await userEvent.click(screen.getByRole("button", { name: "Lưu thay đổi" }));
    await waitFor(() => expect(mocks.mutate).toHaveBeenCalled());
    const form = mocks.mutate.mock.calls[0][0] as FormData;
    expect(form.get("gpu")).toBe("");
    expect(form.get("gpuBrand")).toBe("");
    expect(form.get("gpuType")).toBe("");
  });

  it("submits once when the save button is double-clicked", async () => {
    renderAdmin(<ProductForm product={PRODUCT} />);
    await userEvent.dblClick(screen.getByRole("button", { name: "Lưu thay đổi" }));
    await waitFor(() => expect(mocks.mutate).toHaveBeenCalled());
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(mocks.mutate).toHaveBeenCalledTimes(1);
  });

  it("rejects a negative price instead of silently clamping it", async () => {
    renderAdmin(<ProductForm product={PRODUCT} />);
    await userEvent.clear(screen.getByLabelText("Giá (₫)"));
    await userEvent.type(screen.getByLabelText("Giá (₫)"), "-5");
    await userEvent.click(screen.getByRole("button", { name: "Lưu thay đổi" }));
    expect(await screen.findByText("Giá phải là số nguyên lớn hơn 0 và không quá 2.147.483.647")).toBeInTheDocument();
    expect(mocks.mutate).not.toHaveBeenCalled();
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
