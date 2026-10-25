import {
  expect,
  test,
  request as playwrightRequest,
  type APIRequestContext,
} from "@playwright/test";
import { API, assertApiUp, loginViaUi, registerViaApi } from "./helpers";

const ADMIN = { username: "admin@gmail.com", password: process.env.E2E_ADMIN_PASSWORD ?? "123456" };
const digits = (text: string | null) => Number((text ?? "").replace(/\D/g, ""));

type Product = { id: number; name: string; price: number; quantity: number };

async function createCampaign(admin: APIRequestContext, body: Record<string, unknown>) {
  const created = await admin.post(`${API}/api/v1/admin/promotions`, { data: body });
  expect(created.status(), await created.text()).toBe(201);
  const id = (await created.json()).data.id as number;
  const activated = await admin.patch(`${API}/api/v1/admin/promotions/${id}/state`, {
    data: { action: "ACTIVATE" },
  });
  expect(activated.ok(), await activated.text()).toBeTruthy();
  return id;
}

test.beforeAll(async ({ request }) => {
  await assertApiUp(request);
});

test("flash sale lifecycle: fallback, quote total, allocation and release", async ({
  page,
  request,
}) => {
  test.setTimeout(120_000);
  const admin = await playwrightRequest.newContext();
  const campaigns: number[] = [];
  try {
    expect(
      (await admin.post(`${API}/api/v1/auth/login`, { data: ADMIN })).ok(),
      "E2E admin credentials must be valid",
    ).toBeTruthy();

    // 1. Admin: a Flash Sale (quota 2) over an Automatic fallback that is cheaper than list but dearer than Flash
    const products = (await (await request.get(`${API}/api/v1/products?pageSize=50`)).json())
      .data as Product[];
    const product = products.find((item) => item.quantity >= 3 && item.price >= 5_000_000);
    expect(product, "need an in-stock product priced >= 5.000.000").toBeTruthy();
    const suffix = Date.now();
    const startsAt = new Date(Date.now() - 60_000).toISOString();
    const endsAt = new Date(Date.now() + 60 * 60_000).toISOString();
    campaigns.push(
      await createCampaign(admin, {
        kind: "AUTOMATIC",
        name: `E2E Automatic ${suffix}`,
        discountKind: "FIXED",
        discountValue: 1_000_000,
        startsAt,
        endsAt,
        automatic: { priority: 1, stackableWithCoupon: true, targetProductIds: [product!.id] },
      }),
    );
    const flashId = await createCampaign(admin, {
      kind: "FLASH_SALE",
      name: `E2E Flash ${suffix}`,
      discountKind: "FIXED",
      discountValue: 3_000_000,
      startsAt,
      endsAt,
      flashSale: {
        priority: 10,
        stackableWithCoupon: true,
        showRemainingQuota: true,
        items: [{ productId: product!.id, totalQuota: 2, maxUnitsPerUser: 2 }],
      },
    });
    campaigns.push(flashId);
    const couponCode = `E2E${suffix}`;
    campaigns.push(
      await createCampaign(admin, {
        kind: "COUPON",
        name: `E2E Coupon ${suffix}`,
        discountKind: "PERCENT",
        discountValue: 10,
        startsAt,
        endsAt,
        coupon: { code: couponCode, scope: "ORDER", maxUsesPerUser: 1, isPublic: false },
      }),
    );

    // 2. Anonymous: conditional Flash Sale price, countdown and remaining quota
    await page.goto(`/products/${product!.id}`);
    await expect(page.getByText("Giá Flash Sale có thể áp dụng")).toBeVisible();
    await expect(page.getByText(/^Còn \d{2}:\d{2}:\d{2}$/)).toBeVisible();
    await expect(page.getByText("Còn 2 suất")).toBeVisible();

    // 3. Buyer: quantity 3 needs more units than the quota, so the whole line falls back to Automatic
    const username = await registerViaApi(request, "flash-buyer");
    await page.goto("/login");
    await loginViaUi(page, username);
    await expect(page.getByRole("button", { name: /E2E Tester/ })).toBeVisible();
    const added = await page.request.post(`${API}/api/v1/cart/items`, {
      data: { productId: product!.id, quantity: 3 },
    });
    expect(added.ok()).toBeTruthy();
    await page.goto("/cart");
    await expect(
      page.getByRole("status").filter({ hasText: "Giảm số lượng xuống 2" }),
    ).toBeVisible();

    // 4. Buyer: quantity 2 gets the Flash Sale and a coupon on top; the checkout total equals the order total
    await page.getByRole("spinbutton", { name: "Số lượng" }).first().fill("2");
    await page.getByRole("spinbutton", { name: "Số lượng" }).first().blur();
    await expect(page.getByRole("status").filter({ hasText: "Giảm số lượng xuống" })).toHaveCount(
      0,
    );
    await page.goto("/checkout");
    await page.getByLabel(/Số điện thoại/).fill("0900000000");
    await page.getByLabel(/Địa chỉ nhận hàng/).fill("1 Lê Lợi, Quận 1");
    await page.getByLabel("Mã giảm giá").fill(couponCode);
    await page.getByRole("button", { name: "Áp dụng" }).click();
    const summaryTotal = page.getByText("Tổng cộng").locator("..");
    const expected = (product!.price - 3_000_000) * 2;
    await expect(summaryTotal).toContainText(
      new Intl.NumberFormat("vi-VN").format(Math.round(expected * 0.9)),
    );
    const checkoutTotal = digits(await summaryTotal.textContent());
    const submit = page.getByRole("button", { name: "Xác nhận đặt hàng" });
    await expect(submit).toBeEnabled();
    await submit.click();
    await expect(page).toHaveURL(/\/account\/orders\/(\d+)\?placed=1/);
    const orderId = Number(page.url().match(/orders\/(\d+)/)![1]);

    const order = (await (await page.request.get(`${API}/api/v1/orders/me/${orderId}`)).json())
      .data;
    expect(order.totalPrice).toBe(checkoutTotal);
    expect(order.items[0]).toMatchObject({ promotionKind: "FLASH_SALE" });
    expect(order.items[0].flashSaleAllocation).not.toBeNull();
    const claimed = (
      await (await admin.get(`${API}/api/v1/admin/promotions/${flashId}/summary`)).json()
    ).data;
    expect(claimed).toMatchObject({ claimedUnits: 2, remainingUnits: 0 });

    // 5. Cancel: quota returns and the allocation is RELEASED
    await page.getByRole("button", { name: "Huỷ đơn" }).click();
    await page.getByRole("button", { name: "Xác nhận huỷ" }).click();
    await expect(page.getByText("Đã huỷ", { exact: true })).toBeVisible();
    const released = (
      await (await admin.get(`${API}/api/v1/admin/promotions/${flashId}/summary`)).json()
    ).data;
    expect(released).toMatchObject({ claimedUnits: 0, remainingUnits: 2, releasedUnits: 2 });
    const allocations = (
      await (await admin.get(`${API}/api/v1/admin/promotions/${flashId}/allocations`)).json()
    ).data as Array<{ status: string }>;
    expect(allocations.map((allocation) => allocation.status)).toEqual(["RELEASED"]);
  } finally {
    for (const id of campaigns)
      await admin.patch(`${API}/api/v1/admin/promotions/${id}/state`, { data: { action: "END" } });
    await admin.dispose();
  }
});
