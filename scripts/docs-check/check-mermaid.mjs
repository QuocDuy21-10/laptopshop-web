// usage: node check-mermaid.mjs <repo-root>
import { readdirSync, readFileSync, statSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { join, relative, resolve } from "node:path";
import { createRequire } from "node:module";

const repo = resolve(process.argv[2] ?? ".");
const require = createRequire(join(repo, "package.json"));
const { JSDOM } = require("jsdom");
const { window } = new JSDOM("<!doctype html><html><body></body></html>");
globalThis.window = window;
globalThis.document = window.document;
globalThis.DOMParser = window.DOMParser;
globalThis.Element = window.Element;
globalThis.HTMLElement = window.HTMLElement;

const { default: mermaid } = await import(pathToFileURL(join(repo, "node_modules/mermaid/dist/mermaid.core.mjs")).href);
mermaid.initialize({ startOnLoad: false });

const walk = (dir) =>
  readdirSync(dir).flatMap((name) => {
    if (["superpowers", "node_modules", "cache", "dist"].includes(name)) return [];
    const p = join(dir, name);
    return statSync(p).isDirectory() ? walk(p) : p.endsWith(".md") ? [p] : [];
  });

const errors = [];
let count = 0;
for (const file of [...walk(join(repo, "docs")), join(repo, "README.md")]) {
  const text = readFileSync(file, "utf8");
  for (const m of text.matchAll(/```mermaid\n([\s\S]*?)```/g)) {
    count++;
    const line = text.slice(0, m.index).split("\n").length;
    try {
      await mermaid.parse(m[1]);
    } catch (e) {
      errors.push(`${relative(repo, file)}:${line}: ${String(e?.message ?? e).split("\n")[0]}`);
    }
  }
}
if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}
console.log(`check-mermaid: OK (${count} diagrams)`);
