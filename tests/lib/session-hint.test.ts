import { beforeEach, describe, expect, it } from "vitest";
import { shouldCheckSession } from "@/lib/session-hint";

const clearCookie = () => {
  document.cookie = "logged_in=; Max-Age=0; Path=/";
};

beforeEach(() => {
  clearCookie();
  window.sessionStorage.clear();
});

describe("shouldCheckSession", () => {
  it("always checks while the hint cookie is present", () => {
    document.cookie = "logged_in=1; Path=/";
    expect(shouldCheckSession()).toBe(true);
    expect(shouldCheckSession()).toBe(true);
  });

  it("probes once per tab without the cookie (sessions that predate it), then skips for guests", () => {
    expect(shouldCheckSession()).toBe(true);
    expect(shouldCheckSession()).toBe(false);
    expect(shouldCheckSession()).toBe(false);
  });

  it("checks again as soon as the cookie appears (login)", () => {
    shouldCheckSession();
    document.cookie = "logged_in=1; Path=/";
    expect(shouldCheckSession()).toBe(true);
  });
});
