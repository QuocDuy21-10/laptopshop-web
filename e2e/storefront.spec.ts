import { expect, test } from "@playwright/test";
import { assertApiUp, loginViaUi, PASSWORD, registerViaApi, uniqueEmail } from "./helpers";

test.beforeAll(async ({ request }) => {
  await assertApiUp(request);
});

test("browse, filter, search and open a product", async ({ page }) => {
  await page.goto("/products");
  await page.getByRole("checkbox", { name: "Asus" }).first().click();
  await expect(page).toHaveURL(/factory=ASUS/);
  const cards = page.getByRole("article");
  await expect(cards.first()).toBeVisible();
  for (const text of await cards.allInnerTexts()) expect(text.toUpperCase()).toContain("ASUS");

  await page.getByRole("searchbox", { name: "Tìm laptop" }).first().fill("Dell");
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/q=Dell/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Dell");

  await page.getByRole("article").first().getByRole("link").first().click();
  await expect(page).toHaveURL(/\/products\/\d+$/);
  await expect(page.getByRole("button", { name: "Mua ngay" })).toBeVisible();
});

test("compare two laptops", async ({ page }) => {
  await page.goto("/products");
  const cards = page.getByRole("article");
  await cards
    .nth(0)
    .getByRole("button", { name: /^So sánh / })
    .click();
  await cards
    .nth(1)
    .getByRole("button", { name: /^So sánh / })
    .click();

  const bar = page.getByRole("complementary", { name: "So sánh sản phẩm" });
  await bar.getByRole("link", { name: "So sánh (2)" }).click();

  await expect(page).toHaveURL(/\/compare\?ids=\d+,\d+$/);
  await expect(page.getByRole("columnheader")).toHaveCount(2);
  await expect(page.getByRole("rowheader", { name: "RAM" })).toBeVisible();
});

test("register, add to cart, checkout, then cancel the order", async ({ page }) => {
  await page.goto("/register");
  await page.getByLabel("Họ tên").fill("E2E Buyer");
  await page.getByLabel("Email").fill(uniqueEmail("buyer"));
  await page.getByLabel(/^Mật khẩu/).fill(PASSWORD);
  await page.getByLabel("Nhập lại mật khẩu").fill(PASSWORD);
  await page.getByRole("button", { name: "Tạo tài khoản" }).click();
  await expect(page.getByRole("button", { name: /E2E Buyer/ })).toBeVisible();

  await page.goto("/products");
  const firstInStock = page.getByRole("article").filter({ hasText: "Còn hàng" }).first();
  await firstInStock.getByRole("button", { name: /vào giỏ/ }).click();
  await expect(page.getByText("Đã thêm vào giỏ hàng")).toBeVisible();

  await page.goto("/cart");
  await page.getByRole("button", { name: "Tăng" }).first().click();
  await expect(page.getByRole("spinbutton", { name: "Số lượng" }).first()).toHaveValue("2");

  await page.getByRole("link", { name: "Tiến hành đặt hàng" }).click();
  await expect(page.getByLabel(/Tên người nhận/)).toHaveValue("E2E Buyer");
  await page.getByLabel(/Số điện thoại/).fill("0900000000");
  await page.getByLabel(/Địa chỉ nhận hàng/).fill("1 Lê Lợi, Quận 1");
  await page.getByRole("button", { name: "Xác nhận đặt hàng" }).click();

  await expect(page).toHaveURL(/\/account\/orders\/\d+\?placed=1/);
  await expect(page.getByText("Đặt hàng thành công")).toBeVisible();
  await expect(page.getByText("Chờ xác nhận")).toBeVisible();

  await page.getByRole("button", { name: "Huỷ đơn" }).click();
  await page.getByRole("button", { name: "Xác nhận huỷ" }).click();
  await expect(page.getByText("Đã huỷ", { exact: true })).toBeVisible();
});

test("guarded page sends anonymous users through login and back", async ({ page, request }) => {
  const username = await registerViaApi(request, "guard");
  await page.goto("/checkout");
  await expect(page).toHaveURL(/\/login\?next=%2Fcheckout/);
  await loginViaUi(page, username);
  // an empty cart redirects checkout to the cart page, which proves we came back signed in
  await expect(page).toHaveURL(/\/cart$/);
  await expect(page.getByText("Giỏ hàng đang trống")).toBeVisible();
});

test("log out", async ({ page, request }) => {
  const username = await registerViaApi(request, "logout");
  await page.goto("/login");
  await loginViaUi(page, username);
  await page.getByRole("button", { name: /E2E Tester/ }).click();
  await page.getByRole("menuitem", { name: "Đăng xuất" }).click();
  await expect(page.getByRole("link", { name: "Đăng nhập" })).toBeVisible();
  await page.goto("/account");
  await expect(page).toHaveURL(/\/login\?next=%2Faccount/);
});

async function completeAdvisor(page: import("@playwright/test").Page) {
  await page.goto("/advisor");
  await page.getByLabel(/Ngân sách tối đa/).fill("40000000");
  await page.getByLabel("Lập trình / CNTT").check();
  await page.getByRole("button", { name: "Tiếp tục" }).click();
  await page.getByRole("checkbox", { name: "Hiệu năng" }).check();
  await page.getByRole("button", { name: "Tiếp tục" }).click();
  await page.getByRole("radio", { name: "8 GB" }).check();
  await page.getByRole("checkbox", { name: "Docker / máy ảo" }).check();
  await page.getByRole("button", { name: "Tiếp tục" }).click();
  await page.getByRole("button", { name: "Nhận tư vấn" }).click();
  await expect(page.getByRole("heading", { name: "Laptop phù hợp với bạn" })).toBeFocused();
}

test("public advisor recommends three laptops and reuses compare", async ({ page }) => {
  await completeAdvisor(page);
  await expect(page.getByRole("article")).toHaveCount(3);
  await expect(page.getByRole("article").first()).toContainText(/\d+\/100/);
  const cards = page.getByRole("article");
  await cards.nth(0).getByRole("button", { name: /^So sánh / }).click();
  await cards.nth(1).getByRole("button", { name: /^So sánh / }).click();
  await page.getByRole("complementary", { name: "So sánh sản phẩm" }).getByRole("link", { name: "So sánh (2)" }).click();
  await expect(page).toHaveURL(/\/compare\?ids=\d+,\d+$/);
  await expect(page.getByRole("columnheader")).toHaveCount(2);
});

test("advisor remains usable without horizontal overflow at 320px", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await completeAdvisor(page);
  await expect(page.getByRole("heading", { name: "Laptop phù hợp với bạn" })).toBeFocused();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await expect(page.getByRole("button", { name: "Sửa tiêu chí" })).not.toBeVisible();
});
