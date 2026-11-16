// Downloads each vendor's site icon into public/logos/<slug>.png
// Usage: npm run logos   (re-run anytime; existing files are skipped unless --force)
import { seedVendors } from "../src/data/seed-data.mjs";
import fs from "node:fs";
import path from "node:path";

const dir = path.resolve("public/logos");
fs.mkdirSync(dir, { recursive: true });
const force = process.argv.includes("--force");
const results = { ok: [], missing: [] };

async function tryFetch(url) {
  try {
    const r = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" }, redirect: "follow", signal: AbortSignal.timeout(15000) });
    if (!r.ok) return null;
    const buf = Buffer.from(await r.arrayBuffer());
    return buf.length > 400 ? buf : null; // skip tiny default globes
  } catch { return null; }
}

await Promise.all(seedVendors.map(async (v) => {
  const file = path.join(dir, `${v.slug}.png`);
  if (!force && fs.existsSync(file)) return results.ok.push(v.slug);
  const host = v.website_url ? new URL(v.website_url).hostname : "";
  if (!host) return results.missing.push(v.slug);
  const buf = (await tryFetch(`https://www.google.com/s2/favicons?domain=${host}&sz=256`))
    || (await tryFetch(`https://icons.duckduckgo.com/ip3/${host}.ico`));
  if (buf) { fs.writeFileSync(file, buf); results.ok.push(v.slug); } else results.missing.push(v.slug);
}));
fs.writeFileSync(path.join(dir, "index.json"), JSON.stringify(results.ok.sort()));
console.log(`logos ok: ${results.ok.length}, missing: ${results.missing.length}`, results.missing.join(", "));
