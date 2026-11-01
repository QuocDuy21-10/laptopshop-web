import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";

import { HeaderFrame } from "@/components/layout/Header/HeaderFrame";

let desktop = true;
let nextFrame = 0;
let mediaChange: (() => void) | undefined;
const frames = new Map<number, FrameRequestCallback>();
const removeMedia = vi.fn();
const setY = (value: number) =>
  Object.defineProperty(window, "scrollY", { configurable: true, value });
const flush = () =>
  act(() => {
    const callbacks = [...frames.values()];
    frames.clear();
    callbacks.forEach((callback) => callback(0));
  });
const scroll = (value: number) => {
  setY(value);
  fireEvent.scroll(window);
  flush();
};
const mount = () =>
  render(
    <>
      <HeaderFrame
        mainRow={<input aria-label="Tìm laptop" />}
        navigationRow={
          <nav aria-label="Danh mục">
            <a href="/account/warranties">Bảo hành</a>
          </nav>
        }
      />
      <button type="button">Nội dung</button>
    </>,
  );
const row = () => {
  const navigationRow = screen.getByRole("navigation", {
    name: "Danh mục",
    hidden: true,
  }).parentElement;
  if (!navigationRow) throw new Error("Missing navigation wrapper");
  return navigationRow;
};

beforeEach(() => {
  desktop = true;
  nextFrame = 0;
  frames.clear();
  removeMedia.mockReset();
  setY(0);
  vi.stubGlobal(
    "matchMedia",
    vi.fn((query: string) => ({
      get matches() {
        return desktop;
      },
      media: query,
      addEventListener: (_event: string, callback: () => void) => {
        mediaChange = callback;
      },
      removeEventListener: removeMedia,
    })),
  );
  vi.stubGlobal(
    "requestAnimationFrame",
    vi.fn((callback: FrameRequestCallback) => {
      frames.set(++nextFrame, callback);
      return nextFrame;
    }),
  );
  vi.stubGlobal(
    "cancelAnimationFrame",
    vi.fn((id: number) => frames.delete(id)),
  );
});
afterEach(() => vi.restoreAllMocks());

describe("HeaderFrame", () => {
  it("collapses only beyond 120px and opens on even a one-pixel upward scroll", () => {
    mount();
    expect(row()).not.toHaveAttribute("inert");
    scroll(120);
    expect(row()).not.toHaveAttribute("inert");
    scroll(121);
    expect(row()).toHaveAttribute("inert");
    scroll(200);
    scroll(199);
    expect(row()).not.toHaveAttribute("inert");
    scroll(199);
    expect(row()).not.toHaveAttribute("inert");
    scroll(300);
    expect(row()).toHaveAttribute("inert");
    scroll(0);
    expect(row()).not.toHaveAttribute("inert");
  });

  it.each(["search", "navigation"])("preserves %s focus while scrolling downward", (target) => {
    mount();
    const focused = target === "search" ? screen.getByRole("textbox") : screen.getByRole("link");
    act(() => focused.focus());
    scroll(200);
    expect(row()).not.toHaveAttribute("inert");
    expect(focused).toHaveFocus();
    act(() => screen.getByRole("button", { name: "Nội dung" }).focus());
    scroll(201);
    expect(row()).toHaveAttribute("inert");
  });

  it("opens the hidden navigation when focus moves into the main header row", () => {
    mount();
    scroll(200);
    expect(row()).toHaveAttribute("inert");
    act(() => screen.getByRole("textbox").focus());
    expect(row()).not.toHaveAttribute("inert");
  });

  it("does not collapse on mobile and resets across breakpoint changes", () => {
    desktop = false;
    mount();
    scroll(500);
    expect(row()).not.toHaveAttribute("inert");
    act(() => {
      desktop = true;
      mediaChange?.();
    });
    expect(row()).not.toHaveAttribute("inert");
    scroll(501);
    expect(row()).toHaveAttribute("inert");
    act(() => {
      desktop = false;
      mediaChange?.();
    });
    expect(row()).not.toHaveAttribute("inert");
    expect(window.matchMedia).toHaveBeenCalledWith("(min-width: 1024px)");
  });

  it("batches passive scroll work into one frame and cancels work on unmount", () => {
    const added = vi.spyOn(window, "addEventListener");
    const removed = vi.spyOn(window, "removeEventListener");
    const { unmount } = mount();
    setY(200);
    fireEvent.scroll(window);
    setY(201);
    fireEvent.scroll(window);
    expect(frames.size).toBe(1);
    flush();
    expect(row()).toHaveAttribute("inert");
    const registration = added.mock.calls.find(([event]) => event === "scroll");
    expect(registration?.[2]).toEqual({ passive: true });
    fireEvent.scroll(window);
    expect(frames.size).toBe(1);
    unmount();
    expect(frames.size).toBe(0);
    expect(cancelAnimationFrame).toHaveBeenCalled();
    expect(removed).toHaveBeenCalledWith("scroll", registration?.[1]);
    expect(removeMedia).toHaveBeenCalledWith("change", expect.any(Function));
  });
});
