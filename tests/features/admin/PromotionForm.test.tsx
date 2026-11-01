import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { renderAdmin } from "../../utils";
import { PromotionForm } from "@/features/admin/promotions/PromotionForm";

const mocks = vi.hoisted(() => ({ push: vi.fn(), mutate: vi.fn(), useAdminProducts: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: mocks.push }) }));
vi.mock("@/features/admin/promotions/hooks", () => ({ useCreatePromotion: () => ({ mutate: mocks.mutate, isPending: false, error: null }) }));
vi.mock("@/features/admin/products/hooks", () => ({ useAdminProducts: mocks.useAdminProducts }));

beforeEach(() => {
  vi.clearAllMocks();
  mocks.useAdminProducts.mockImplementation((query: { q?: string }) => ({
    data: { data: query.q ? [{ id: 3, name: "Laptop Dell XPS" }] : [] },
  }));
});

const pickFlashSale = async () => {
  await userEvent.click(screen.getByRole("combobox", { name: "Loại" }));
  await userEvent.click(await screen.findByText("Flash Sale"));
};
const fillBasics = async () => {
  await userEvent.type(screen.getByLabelText("Tên chương trình"), "Flash cuối tuần");
  fireEvent.change(screen.getByLabelText("Bắt đầu"), { target: { value: "2026-11-01T10:00" } });
  fireEvent.change(screen.getByLabelText("Kết thúc"), { target: { value: "2026-11-01T12:00" } });
};

const pickKind = async (label: string) => {
  await userEvent.click(screen.getByRole("combobox", { name: "Loại" }));
  await userEvent.click(await screen.findByText(label));
};
const pickTarget = async () => {
  const select = screen.getByRole("combobox", { name: "Sản phẩm áp dụng" });
  await userEvent.click(select);
  await userEvent.type(select, "Laptop");
  await userEvent.click(await screen.findByText("Laptop Dell XPS"));
};

describe("PromotionForm automatic", () => {
  it("sends the automatic policy with priority, stacking and target products", async () => {
    renderAdmin(<PromotionForm />);
    await pickKind("Tự động");
    await fillBasics();
    fireEvent.change(screen.getByLabelText("Độ ưu tiên"), { target: { value: "5" } });
    await userEvent.click(screen.getByRole("switch", { name: "Cho phép dùng cùng coupon" }));
    await pickTarget();
    await userEvent.click(screen.getByRole("button", { name: "Lưu bản nháp" }));

    await waitFor(() => expect(mocks.mutate).toHaveBeenCalledTimes(1));
    const body = mocks.mutate.mock.calls[0][0];
    expect(body).toMatchObject({
      kind: "AUTOMATIC",
      automatic: { priority: 5, stackableWithCoupon: true, targetProductIds: [3] },
    });
    expect(body.coupon).toBeUndefined();
  });

  it("blocks an automatic promotion without target products", async () => {
    renderAdmin(<PromotionForm />);
    await pickKind("Tự động");
    await fillBasics();
    await userEvent.click(screen.getByRole("button", { name: "Lưu bản nháp" }));
    expect(await screen.findByText("Chọn ít nhất một sản phẩm.")).toBeInTheDocument();
    expect(mocks.mutate).not.toHaveBeenCalled();
  });
});

describe("PromotionForm coupon", () => {
  it("sends an order coupon with usage limits", async () => {
    renderAdmin(<PromotionForm />);
    await fillBasics();
    await userEvent.type(screen.getByLabelText("Mã coupon"), "welcome10");
    fireEvent.change(screen.getByLabelText("Giá trị đơn tối thiểu"), { target: { value: "500000" } });
    fireEvent.change(screen.getByLabelText("Giảm tối đa"), { target: { value: "200000" } });
    fireEvent.change(screen.getByLabelText("Tổng lượt dùng"), { target: { value: "100" } });
    fireEvent.change(screen.getByLabelText("Lượt mỗi khách"), { target: { value: "2" } });
    await userEvent.click(screen.getByRole("button", { name: "Lưu bản nháp" }));

    await waitFor(() => expect(mocks.mutate).toHaveBeenCalledTimes(1));
    expect(mocks.mutate.mock.calls[0][0]).toMatchObject({
      kind: "COUPON",
      coupon: {
        code: "welcome10",
        scope: "ORDER",
        minOrderValue: 500000,
        maxDiscount: 200000,
        maxUses: 100,
        maxUsesPerUser: 2,
        isPublic: false,
        targetProductIds: [],
      },
    });
  });

  it("sends a product coupon with its target products", async () => {
    renderAdmin(<PromotionForm />);
    await fillBasics();
    await userEvent.type(screen.getByLabelText("Mã coupon"), "dell2tr");
    await userEvent.click(screen.getByRole("combobox", { name: "Phạm vi" }));
    await userEvent.click(await screen.findByText("Theo sản phẩm"));
    await pickTarget();
    await userEvent.click(screen.getByRole("button", { name: "Lưu bản nháp" }));

    await waitFor(() => expect(mocks.mutate).toHaveBeenCalledTimes(1));
    expect(mocks.mutate.mock.calls[0][0]).toMatchObject({
      coupon: { code: "dell2tr", scope: "PRODUCT", targetProductIds: [3] },
    });
  });

  it("blocks a coupon without a code", async () => {
    renderAdmin(<PromotionForm />);
    await fillBasics();
    await userEvent.click(screen.getByRole("button", { name: "Lưu bản nháp" }));
    expect(await screen.findByText("Nhập mã coupon.")).toBeInTheDocument();
    expect(mocks.mutate).not.toHaveBeenCalled();
  });
});

describe("PromotionForm flash sale", () => {
  it("blocks submit until a flash sale has a valid quota row", async () => {
    renderAdmin(<PromotionForm />);
    await pickFlashSale();
    await fillBasics();
    await userEvent.click(screen.getByRole("button", { name: "Lưu bản nháp" }));
    expect(await screen.findByText("Cần ít nhất một sản phẩm Flash Sale.")).toBeInTheDocument();
    expect(mocks.mutate).not.toHaveBeenCalled();
  });

  it("creates a flash sale from a searched product with quota rows", async () => {
    renderAdmin(<PromotionForm />);
    await pickFlashSale();
    await fillBasics();
    await userEvent.click(screen.getByRole("button", { name: "Thêm sản phẩm" }));
    const select = screen.getByRole("combobox", { name: "Sản phẩm dòng 1" });
    await userEvent.click(select);
    await userEvent.type(select, "Laptop");
    await userEvent.click(await screen.findByText("Laptop Dell XPS"));
    fireEvent.change(screen.getByLabelText("Quota tổng dòng 1"), { target: { value: "10" } });
    fireEvent.change(screen.getByLabelText("Tối đa mỗi user dòng 1"), { target: { value: "2" } });
    await userEvent.click(screen.getByRole("button", { name: "Lưu bản nháp" }));

    await waitFor(() => expect(mocks.mutate).toHaveBeenCalledTimes(1));
    const body = mocks.mutate.mock.calls[0][0];
    expect(body).toMatchObject({
      kind: "FLASH_SALE",
      name: "Flash cuối tuần",
      startsAt: new Date("2026-11-01T10:00").toISOString(),
      endsAt: new Date("2026-11-01T12:00").toISOString(),
      flashSale: { items: [{ productId: 3, totalQuota: 10, maxUnitsPerUser: 2 }] },
    });
    expect(body.coupon).toBeUndefined();
  });
});
