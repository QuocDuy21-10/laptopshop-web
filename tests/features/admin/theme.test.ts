import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { adminColors } from "@/features/admin/theme";

// antd cannot read CSS variables, so theme.ts repeats token values; this guards against drift
const tokens = readFileSync(path.resolve(__dirname, "../../../src/styles/_tokens.scss"), "utf8");
const tokenValue = (name: string) => tokens.match(new RegExp(`--color-${name}:\\s*(#[0-9a-f]+);`, "i"))?.[1]?.toLowerCase();
const kebab = (key: string) => key.replace(/[A-Z]/g, (ch) => `-${ch.toLowerCase()}`);

describe("admin theme", () => {
  it.each(Object.entries(adminColors))("mirrors --color-%s from _tokens.scss", (key, value) => {
    expect(tokenValue(kebab(key))).toBe(value.toLowerCase());
  });
});
