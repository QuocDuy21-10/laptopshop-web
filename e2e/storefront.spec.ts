import { expect, test } from "@playwright/test";
import { assertApiUp, createCompletedReviewOrder, loginViaUi, PASSWORD, registerViaApi, uniqueEmail } from "./helpers";

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

test("dynamic facets keep OR groups, counts and URL navigation stable", async ({ page }) => {
  await page.goto("/products");
  const sidebar = page.getByRole("complementary", { name: "Bộ lọc" });
  await expect(sidebar.getByText(/^Intel \(\d+\)$/).first()).toBeVisible();
  await sidebar.getByRole("checkbox", { name: /Asus/ }).click();
  await expect(page).toHaveURL(/factory=ASUS/);
  await sidebar.getByRole("checkbox", { name: /Dell/ }).click();
  await expect(page).toHaveURL(/factory=ASUS(?:%2C|,)DELL/);
  await page.reload();
  await expect(page).toHaveURL(/factory=ASUS(?:%2C|,)DELL/);
  await page.getByRole("link", { name: "Bỏ lọc Asus" }).click();
  await expect(page).toHaveURL(/factory=DELL/);
  await page.goBack();
  await expect(page).toHaveURL(/factory=ASUS(?:%2C|,)DELL/);
});

test("mobile facet draft can cancel or apply without horizontal overflow", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 800 });
  await page.goto("/products");
  const initialUrl = page.url();
  await page.getByRole("button", { name: /^Bộ lọc/ }).click();
  const dialog = page.getByRole("dialog");
  await dialog.locator("summary").filter({ hasText: "RAM" }).click();
  await dialog.getByRole("checkbox", { name: /16 GB/ }).click();
  await expect(page).toHaveURL(initialUrl);
  await dialog.getByRole("button", { name: "Đóng" }).click();
  await page.getByRole("button", { name: /^Bộ lọc/ }).click();
  const reopened = page.getByRole("dialog");
  await reopened.locator("summary").filter({ hasText: "RAM" }).click();
  expect(await reopened.getByRole("checkbox", { name: /16 GB/ }).isChecked()).toBe(false);
  await reopened.getByRole("checkbox", { name: /16 GB/ }).click();
  await expect(page.getByRole("dialog").getByRole("button", { name: /Xem \d+ sản phẩm/ })).toBeEnabled();
  await page.getByRole("dialog").getByRole("button", { name: /Xem \d+ sản phẩm/ }).click();
  await expect(page).toHaveURL(/ramGb=16/);

  await page.setViewportSize({ width: 320, height: 800 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test("catalog rating cards, filter, sort and mobile facet stay consistent", async ({ page, request }) => {
  test.skip(!process.env.E2E_ADMIN_PASSWORD, "E2E_ADMIN_PASSWORD is required to seed a published rating");
  const setup = await createCompletedReviewOrder(request);
  const adminLogin = await request.post(`${setup.api}/api/v1/auth/login`, {
    data: { username: "admin@gmail.com", password: process.env.E2E_ADMIN_PASSWORD },
  });
  expect(adminLogin.ok()).toBeTruthy();
  for (const status of ["SHIPPING", "COMPLETED"]) {
    const updated = await request.patch(`${setup.api}/api/v1/admin/orders/${setup.orderId}/status`, { data: { status } });
    expect(updated.ok()).toBeTruthy();
  }

  await page.goto(`/login?next=/account/orders/${setup.orderId}`);
  await loginViaUi(page, setup.username);
  await page.getByRole("button", { name: "Đánh giá sản phẩm" }).click();
  await page.getByRole("radio", { name: "4 sao" }).check();
  await page.getByLabel("Nội dung").fill("Đánh giá rating catalog đủ dài.");
  await page.getByRole("radio", { name: /Công khai tên/ }).check();
  await page.getByRole("button", { name: "Gửi đánh giá" }).click();

  await page.goto("/products?sort=rating_desc");
  await expect(page.getByRole("article").filter({ hasText: "★ 4.0 (1)" })).toBeVisible();
  await expect(page.locator("select")).toHaveValue("rating_desc");
  await page.getByRole("checkbox", { name: /Từ 4 sao/ }).first().click();
  await expect(page).toHaveURL(/minRating=4/);
  await expect(page.getByRole("article").filter({ hasText: "★ 4.0 (1)" })).toBeVisible();

  await page.setViewportSize({ width: 390, height: 800 });
  await page.goto("/products?minRating=4");
  await page.getByRole("button", { name: /^Bộ lọc/ }).click();
  await expect(page.getByRole("dialog").getByText("Đánh giá tối thiểu")).toBeVisible();
  await expect(page.getByRole("dialog").getByRole("radio", { name: /Từ 4 sao/ })).toBeChecked();
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

test("verified product review lifecycle", async ({ browser, request }) => {
  test.skip(!process.env.E2E_ADMIN_PASSWORD, "E2E_ADMIN_PASSWORD is required for the admin moderation half of this lifecycle");
  const setup = await createCompletedReviewOrder(request);
  const adminContext = await browser.newContext();
  const adminPage = await adminContext.newPage();
  await adminPage.goto("/login?next=/admin");
  await loginViaUi(adminPage, "admin@gmail.com", process.env.E2E_ADMIN_PASSWORD!);
  for (const status of ["SHIPPING", "COMPLETED"]) {
    await adminPage.request.patch(`${setup.api}/api/v1/admin/orders/${setup.orderId}/status`, { data: { status } });
  }

  const customerContext = await browser.newContext();
  const customerPage = await customerContext.newPage();
  await customerPage.goto(`/login?next=/account/orders/${setup.orderId}`);
  await loginViaUi(customerPage, setup.username);
  await customerPage.getByRole("button", { name: "Đánh giá sản phẩm" }).click();
  await customerPage.getByRole("radio", { name: "5 sao" }).check();
  await customerPage.getByLabel("Nội dung").fill("Nội dung review E2E đủ dài.");
  await customerPage.getByRole("radio", { name: /Ẩn danh/ }).check();
  await customerPage.getByLabel("Chọn ảnh").setInputFiles({
    name: "laptop.png",
    mimeType: "image/png",
    buffer: Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=", "base64"),
  });
  await customerPage.getByRole("button", { name: "Gửi đánh giá" }).click();

  await customerPage.goto(`/products/${setup.productId}#reviews`);
  await expect(customerPage.getByText("****")).toBeVisible();
  await expect(customerPage.getByRole("img", { name: /Ảnh review/ })).toHaveCount(1);
  const authorReview = customerPage.getByRole("article").filter({ hasText: "Nội dung review E2E đủ dài." });
  await expect(authorReview.getByRole("button", { name: "Không thể đánh dấu hữu ích" })).toBeDisabled();

  const voterUsername = await registerViaApi(request, "helpful-voter");
  const voterContext = await browser.newContext();
  const voterPage = await voterContext.newPage();
  await voterPage.goto(`/login?next=/products/${setup.productId}%23reviews`);
  await loginViaUi(voterPage, voterUsername);
  await voterPage.goto(`/products/${setup.productId}#reviews`);
  const voterReview = voterPage.getByRole("article").filter({ hasText: "Nội dung review E2E đủ dài." });
  const helpfulButton = voterReview.getByRole("button", { name: /đánh dấu hữu ích/i });
  await helpfulButton.click();
  await expect(helpfulButton).toHaveAttribute("aria-pressed", "true");
  await voterPage.reload();
  const reloadedHelpfulButton = voterPage.getByRole("article").filter({ hasText: "Nội dung review E2E đủ dài." }).getByRole("button", { name: /bỏ đánh dấu hữu ích/i });
  await expect(reloadedHelpfulButton).toHaveAttribute("aria-pressed", "true");
  await reloadedHelpfulButton.click();
  await expect(voterPage.getByRole("article").filter({ hasText: "Nội dung review E2E đủ dài." }).getByRole("button", { name: /đánh dấu hữu ích/i })).toHaveAttribute("aria-pressed", "false");
  await customerPage.setViewportSize({ width: 320, height: 800 });
  expect(await customerPage.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);

  const publicReviews = (await (await request.get(`${setup.api}/api/v1/products/${setup.productId}/reviews`)).json()).data as Array<{ id: number; content: string }>;
  const reviewId = publicReviews.find((review) => review.content === "Nội dung review E2E đủ dài.")?.id;
  expect(reviewId).toBeTruthy();
  await adminPage.goto("/admin/reviews");
  await adminPage.getByRole("link", { name: setup.productName, exact: true }).click();
  await adminPage.getByRole("button", { name: "Ẩn review" }).click();
  await adminPage.getByPlaceholder("Lý do ẩn review").fill("Cần kiểm tra nội dung");
  await adminPage.getByRole("button", { name: "Ẩn", exact: true }).click();

  const hiddenVote = await voterPage.request.put(`${setup.api}/api/v1/reviews/${reviewId}/helpful`);
  expect(hiddenVote.status()).toBe(404);
  await customerPage.reload();
  await voterPage.reload();
  await expect(customerPage.getByText("Nội dung review E2E đủ dài.")).not.toBeVisible();
  await expect(voterPage.getByText("Nội dung review E2E đủ dài.")).not.toBeVisible();
  await expect(customerPage.getByRole("img", { name: /Ảnh review/ })).toHaveCount(0);
  await customerPage.goto(`/account/orders/${setup.orderId}`);
  await customerPage.getByRole("button", { name: "Sửa đánh giá của tôi" }).click();
  await customerPage.getByLabel("Nội dung").fill("Nội dung review E2E đã chỉnh sửa đủ dài.");
  await customerPage.getByRole("button", { name: "Gửi đánh giá" }).click();

  await adminPage.reload();
  await adminPage.getByRole("button", { name: "Khôi phục" }).click();
  await customerPage.goto(`/products/${setup.productId}#reviews`);
  await expect(customerPage.getByText("Nội dung review E2E đã chỉnh sửa đủ dài.")).toBeVisible();
  await expect(customerPage.getByRole("img", { name: /Ảnh review/ })).toHaveCount(1);

  await customerPage.goto(`/account/orders/${setup.orderId}`);
  await customerPage.getByRole("button", { name: "Sửa đánh giá của tôi" }).click();
  await customerPage.getByRole("button", { name: "Xóa đánh giá" }).click();
  await customerPage.getByRole("button", { name: "Xác nhận xóa" }).click();
  await customerPage.getByRole("button", { name: "Đánh giá sản phẩm" }).click();
  await customerPage.getByRole("radio", { name: "5 sao" }).check();
  await customerPage.getByLabel("Nội dung").fill("Nội dung review viết lại đủ dài.");
  await customerPage.getByRole("radio", { name: /Công khai tên/ }).check();
  await customerPage.getByRole("button", { name: "Gửi đánh giá" }).click();
  await customerContext.close();
  await voterContext.close();
  await adminContext.close();
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
