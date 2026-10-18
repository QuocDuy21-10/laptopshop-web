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
