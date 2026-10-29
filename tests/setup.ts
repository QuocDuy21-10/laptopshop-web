import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, beforeEach, vi } from "vitest";

// the API's session hint cookie: tests that fetch /users/me model a signed-in browser unless they clear it
beforeEach(() => {
  if (typeof document !== "undefined") document.cookie = "logged_in=1; Path=/";
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

// antd's responsive helpers call matchMedia, which jsdom lacks (guarded: some tests run in the node environment)
if (typeof window !== "undefined" && !window.matchMedia) {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }),
  });
}

// antd tables and selects observe their size (assigned directly: afterEach unstubs vi.stubGlobal)
if (typeof window !== "undefined" && typeof window.ResizeObserver === "undefined") {
  window.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}
