import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { renderAdmin } from "../../utils";
import { PromotionDetail } from "@/features/admin/promotions/PromotionDetail";

const mocks = vi.hoisted(() => ({
  detail: vi.fn(),
  summary: vi.fn(),
  allocations: vi.fn(),
  update: vi.fn(),
  updateState: { isPending: false, error: null as unknown },
}));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock("@/features/admin/products/hooks", () => ({ useAdminProducts: () => ({ data: { data: [] } }) }));
vi.mock("@/features/admin/promotions/hooks", () => ({
  useAdminPromotion: mocks.detail,
  useAdminPromotionSummary: mocks.summary,
  useAdminPromotionAllocations: mocks.allocations,
  useTransitionPromotion: () => ({ mutate: vi.fn() }),
  useUpdatePromotion: () => ({ mutate: mocks.update, ...mocks.updateState }),
  useCreatePromotion: () => ({ mutate: vi.fn(), isPending: false, error: null }),
}));

const promotion = (over: object = {}) => ({
  id: 42, name: "Flash", kind: "FLASH_SALE", state: "DRAFT", effectiveState: "DRAFT", discountKind: "PERCENT", discountValue: 10,
  startsAt: "2026-11-10T03:00:00.000Z", endsAt: "2026-11-20T03:00:00.000Z",
  coupon: null, lockedFields: [], products: [{ id: 3, name: "Laptop Dell XPS", image: null }], updatedAt: "2026-10-25T00:00:00.000Z",
  flashSale: { priority: 0, stackableWithCoupon: false, showRemainingQuota: true, quotas: [{ productId: 3, totalQuota: 5, claimedUnits: 2, remainingQuota: 3, maxUnitsPerUser: 2 }] },
  ...over,
});
const active = promotion({
  state: "ACTIVE", effectiveState: "RUNNING",
  lockedFields: ["kind", "priority", "stackableWithCoupon", "maxUnitsPerUser"],
});

beforeEach(() => {
  vi.clearAllMocks();
  mocks.updateState.isPending = false;
  mocks.updateState.error = null;
  mocks.detail.mockReturnValue({ isPending: false, error: null, data: { data: promotion() } });
  mocks.summary.mockReturnValue({ isPending: false, error: null, data: { data: { promotionId: 42, kind: "FLASH_SALE", redemptionCount: 0, activeUsageCount: 0, totalDiscountAmount: 600, totalQuota: 5, claimedUnits: 2, remainingUnits: 3, releasedUnits: 1, completedUnits: 0, allocationCount: 3 } } });
  mocks.allocations.mockReturnValue({ isPending: false, error: null, data: { data: [], meta: { page: 1, pageSize: 10, total: 0, totalPages: 0 } } });
});

describe("PromotionDetail flash sale", () => {
  it("renders the quota editor, summary and allocation history", () => {
    renderAdmin(<PromotionDetail id={42} />);
    expect(screen.getByRole("region", { name: "Quota Flash Sale" })).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Tổng quan Flash Sale" })).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Lịch sử allocation Flash Sale" })).toBeInTheDocument();
    expect(mocks.summary).toHaveBeenCalledWith(42, true);
  });

  it("does not load flash sale reports for other promotion kinds", () => {
    mocks.detail.mockReturnValue({ isPending: false, error: null, data: { data: promotion({ kind: "COUPON", flashSale: null }) } });
    renderAdmin(<PromotionDetail id={42} />);
    expect(screen.queryByRole("region", { name: "Quota Flash Sale" })).not.toBeInTheDocument();
    expect(mocks.summary).toHaveBeenCalledWith(42, false);
    expect(mocks.allocations).toHaveBeenCalledWith(42, expect.anything(), false);
  });

  it("lets a draft edit every flash sale field", async () => {
    renderAdmin(<PromotionDetail id={42} />);
    expect(screen.getByLabelText("Tối đa mỗi user dòng 1")).toBeEnabled();
    fireEvent.change(screen.getByLabelText("Quota tổng dòng 1"), { target: { value: "8" } });
    await userEvent.click(screen.getByRole("button", { name: "Lưu quota Flash Sale" }));
    expect(mocks.update).toHaveBeenCalledWith({
      flashSale: { priority: 0, stackableWithCoupon: false, showRemainingQuota: true, items: [{ productId: 3, totalQuota: 8, maxUnitsPerUser: 2 }] },
    });
  });

  it("locks an active promotion's product and per-user limit and refuses to lower the total quota", async () => {
    mocks.detail.mockReturnValue({ isPending: false, error: null, data: { data: active } });
    renderAdmin(<PromotionDetail id={42} />);
    expect(screen.getByRole("combobox", { name: "Sản phẩm dòng 1" })).toBeDisabled();
    expect(screen.getByLabelText("Tối đa mỗi user dòng 1")).toBeDisabled();

    fireEvent.change(screen.getByLabelText("Quota tổng dòng 1"), { target: { value: "4" } });
    expect(screen.getByText("Không được giảm quota tổng.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Lưu quota Flash Sale" })).toBeDisabled();

    fireEvent.change(screen.getByLabelText("Quota tổng dòng 1"), { target: { value: "9" } });
    await userEvent.click(screen.getByRole("button", { name: "Lưu quota Flash Sale" }));
    await waitFor(() => expect(mocks.update).toHaveBeenCalledWith({ flashSale: { showRemainingQuota: true, items: [{ productId: 3, totalQuota: 9, maxUnitsPerUser: 2 }] } }));
  });

  it("shows a failed quota update", () => {
    mocks.updateState.error = new Error("boom");
    renderAdmin(<PromotionDetail id={42} />);
    expect(screen.getByRole("alert")).toHaveTextContent("Đã có lỗi xảy ra");
  });

  it("shows summary and allocation load errors", () => {
    mocks.summary.mockReturnValue({ isPending: false, error: new Error("summary down"), data: undefined });
    mocks.allocations.mockReturnValue({ isPending: false, error: new Error("alloc down"), data: undefined });
    renderAdmin(<PromotionDetail id={42} />);
    expect(screen.getAllByRole("alert")).toHaveLength(2);
  });
});

const draftCoupon = promotion({
  kind: "COUPON", flashSale: null, automatic: null, description: null,
  coupon: { code: "WELCOME10", scope: "PRODUCT", minOrderValue: 0, maxDiscount: null, maxUses: 100, usedCount: 0, maxUsesPerUser: 1, isPublic: false, targetProductIds: [3] },
});
const draftAutomatic = promotion({
  kind: "AUTOMATIC", flashSale: null, coupon: null, description: null,
  automatic: { priority: 1, stackableWithCoupon: false, targetProductIds: [3] },
});

describe("PromotionDetail draft edit", () => {
  it("prefills a draft coupon and saves the edited fields without the kind", async () => {
    mocks.detail.mockReturnValue({ isPending: false, error: null, data: { data: draftCoupon } });
    renderAdmin(<PromotionDetail id={42} />);
    expect(screen.getByLabelText("Mã coupon")).toHaveValue("WELCOME10");
    expect(await screen.findByText("Laptop Dell XPS")).toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: "Loại" })).toBeDisabled();

    fireEvent.change(screen.getByLabelText("Mức giảm"), { target: { value: "15" } });
    await userEvent.click(screen.getByRole("button", { name: "Lưu thay đổi" }));

    await waitFor(() => expect(mocks.update).toHaveBeenCalledTimes(1));
    const body = mocks.update.mock.calls[0][0];
    expect(body).toMatchObject({
      discountValue: 15,
      startsAt: "2026-11-10T03:00:00.000Z",
      endsAt: "2026-11-20T03:00:00.000Z",
      coupon: { code: "WELCOME10", scope: "PRODUCT", maxUses: 100, maxUsesPerUser: 1, targetProductIds: [3] },
    });
    expect(body).not.toHaveProperty("kind");
  });

  it("saves a draft automatic policy", async () => {
    mocks.detail.mockReturnValue({ isPending: false, error: null, data: { data: draftAutomatic } });
    renderAdmin(<PromotionDetail id={42} />);
    fireEvent.change(screen.getByLabelText("Độ ưu tiên"), { target: { value: "7" } });
    await userEvent.click(screen.getByRole("button", { name: "Lưu thay đổi" }));

    await waitFor(() => expect(mocks.update).toHaveBeenCalledTimes(1));
    expect(mocks.update.mock.calls[0][0]).toMatchObject({
      automatic: { priority: 7, stackableWithCoupon: false, targetProductIds: [3] },
    });
  });

  it("does not offer the draft form once the promotion is active", () => {
    mocks.detail.mockReturnValue({ isPending: false, error: null, data: { data: { ...draftCoupon, state: "ACTIVE", effectiveState: "RUNNING" } } });
    renderAdmin(<PromotionDetail id={42} />);
    expect(screen.queryByRole("button", { name: "Lưu thay đổi" })).not.toBeInTheDocument();
  });
});
