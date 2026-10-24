import { describe, expect, it } from "vitest";
import type {
  ConfigurePriceAlertInput,
  InAppNotification,
  NotificationOperations,
  NotificationPage,
  PriceAlertMode,
  WishlistItem,
  WishlistPage,
  WishlistStatus,
  WishlistSummary,
} from "@/lib/api/types";
import { queryKeys } from "@/lib/api/query-keys";

describe("wishlist notification generated contract", () => {
  it("exports the generated feature aliases", () => {
    const mode: PriceAlertMode = "PERCENT_DROP";
    const nullableMode: WishlistItem["alertMode"] = null;
    const item = null as unknown as WishlistItem;
    const status = null as unknown as WishlistStatus;
    const summary = null as unknown as WishlistSummary;
    const page = null as unknown as WishlistPage;
    const notifications = null as unknown as NotificationPage;
    const notification = null as unknown as InAppNotification;
    const input = null as unknown as ConfigurePriceAlertInput;
    const operations = null as unknown as NotificationOperations;
    const inputs: ConfigurePriceAlertInput[] = [
      { mode: "PERCENT_DROP" },
      { mode: "TARGET_PRICE", targetPrice: 900_000 },
      { mode: null },
    ];

    expect([mode, nullableMode, item, status, summary, page, notifications, notification, input, operations, ...inputs]).toHaveLength(13);
    expect(operations).toBeNull();
  });

  it("isolates private keys by user and canonicalizes status ids", () => {
    expect(queryKeys.wishlist(1, 1)).not.toEqual(queryKeys.wishlist(2, 1));
    expect(queryKeys.wishlistStatus(1, [2, 1])).toEqual(queryKeys.wishlistStatus(1, [1, 2]));
    expect(queryKeys.notifications(1, 1)).not.toEqual(queryKeys.notifications(2, 1));
  });
});
