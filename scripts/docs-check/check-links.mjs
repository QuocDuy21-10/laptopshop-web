// usage: node check-links.mjs <repo-root>  (backend checkout: API_DIR, default ../laptopshop-api)
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { execFileSync } from "node:child_process";

const repo = resolve(process.argv[2] ?? ".");
const api = resolve(repo, process.env.API_DIR ?? "../laptopshop-api");
const docs = join(repo, "docs");
const WEB_BLOB = "https://github.com/QuocDuy21-10/laptopshop-web/blob/main/";
const WEB_TREE = "https://github.com/QuocDuy21-10/laptopshop-web/tree/main/";
const API_BLOB = "https://github.com/QuocDuy21-10/laptopshop-api/blob/main/";
const errors = [];
let count = 0;

const walk = (dir) =>
  readdirSync(dir).flatMap((name) => {
    if (["superpowers", "node_modules", "cache", "dist"].includes(name)) return [];
    const p = join(dir, name);
    return statSync(p).isDirectory() ? walk(p) : p.endsWith(".md") ? [p] : [];
  });

const readWeb = (p) => {
  const f = join(repo, p);
  return existsSync(f) && statSync(f).isFile() ? readFileSync(f, "utf8") : null;
};
const readApi = (p) => {
  try {
    return execFileSync("git", ["-C", api, "show", `origin/main:${p}`], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] });
  } catch {
    return null;
  }
};
const maxLine = (hash) => Math.max(0, ...[...hash.matchAll(/L(\d+)/g)].map((m) => Number(m[1])));

function checkSource(where, url, prefix, read) {
  const [path, hash = ""] = url.slice(prefix.length).split("#");
  const text = read(decodeURIComponent(path));
  if (text === null) return errors.push(`${where}: missing source ${url}`);
  if (maxLine(hash) > text.split("\n").length) errors.push(`${where}: line out of range ${url}`);
}

const sitePathExists = (p) => {
  const clean = p.split("#")[0].replace(/\/$/, "");
  return clean === "" || existsSync(join(docs, `${clean}.md`)) || existsSync(join(docs, clean, "index.md"));
};

const slugs = (file) =>
  new Set(
    readFileSync(file, "utf8")
      .split("\n")
      .filter((l) => /^#{1,6}\s/.test(l))
      .map((l) => l.replace(/^#{1,6}\s+/, "").toLowerCase().replace(/[^\p{L}\p{N}\s_-]/gu, "").trim().replace(/\s+/g, "-")),
  );

function checkAnchor(where, file, hash) {
  if (!hash) return;
  if (!/^[a-z0-9-]+$/.test(hash)) return errors.push(`${where}: non-ASCII anchor #${hash} (differs between GitHub and VitePress)`);
  if (!existsSync(file) || !statSync(file).isFile()) return;
  if (!slugs(file).has(hash)) errors.push(`${where}: anchor #${hash} not found in ${relative(repo, file)}`);
}

function checkLink(where, file, raw) {
  count++;
  if (raw.startsWith("#")) return checkAnchor(where, file, raw.slice(1));
  if (raw.startsWith(WEB_BLOB)) return checkSource(where, raw, WEB_BLOB, readWeb);
  if (raw.startsWith(API_BLOB)) return checkSource(where, raw, API_BLOB, readApi);
  if (raw.startsWith(WEB_TREE)) {
    if (!existsSync(join(repo, decodeURIComponent(raw.slice(WEB_TREE.length).split("#")[0])))) errors.push(`${where}: missing dir ${raw}`);
    return;
  }
  if (/^(https?:|mailto:|#)/.test(raw)) return;
  if (raw.startsWith("/")) {
    if (!sitePathExists(raw)) errors.push(`${where}: broken site link ${raw}`);
    return;
  }
  const [rel, hash] = raw.split("#");
  const target = resolve(dirname(file), decodeURIComponent(rel));
  if (!existsSync(target)) return errors.push(`${where}: broken ${raw}`);
  if (target.endsWith(".md")) checkAnchor(where, target, hash);
}

const files = [...walk(docs), join(repo, "README.md")];
for (const file of files) {
  const lines = readFileSync(file, "utf8").split("\n");
  let fenced = false;
  lines.forEach((line, i) => {
    if (line.trimStart().startsWith("```")) fenced = !fenced;
    if (fenced) return;
    const where = `${relative(repo, file)}:${i + 1}`;
    for (const m of line.matchAll(/\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g)) checkLink(where, file, m[1]);
    for (const m of line.matchAll(/^\s*link:\s*(\/\S+)/g)) checkLink(where, file, m[1]);
  });
}

const config = readFileSync(join(docs, ".vitepress/config.mts"), "utf8");
for (const m of config.matchAll(/link:\s*[`"](\/[^`"$]+)[`"]/g)) checkLink("config.mts", docs, m[1]);
const featureList = config.match(/const features = \[([^\]]+)\]/);
for (const f of featureList ? featureList[1].match(/"([^"]+)"/g).map((s) => s.slice(1, -1)) : []) {
  checkLink("config.mts", docs, `/04-features/${f}`);
  checkLink("config.mts", docs, `/06-api-and-data/data-dictionary/${f}`);
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}
console.log(`check-links: OK (${count} links)`);
