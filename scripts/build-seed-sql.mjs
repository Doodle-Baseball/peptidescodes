// Builds supabase/setup.sql = schema.sql + seed inserts from src/data/seed-data.mjs
// Usage: npm run seed:sql
import fs from "node:fs";
import path from "node:path";
import { seedVendors, seedPages, seedPosts, seedSettings } from "../src/data/seed-data.mjs";

const logos = new Set(JSON.parse(fs.readFileSync(path.resolve("public/logos/index.json"), "utf8")));
const q = (v) => {
  if (v === null || v === undefined) return "null";
  if (typeof v === "boolean") return v ? "true" : "false";
  if (typeof v === "number") return String(v);
  if (typeof v === "object") return `'${JSON.stringify(v).replace(/'/g, "''")}'::jsonb`;
  return `'${String(v).replace(/'/g, "''")}'`;
};
const insert = (table, rows, conflict) => {
  if (!rows.length) return "";
  const cols = Object.keys(rows[0]);
  const values = rows.map((r) => `  (${cols.map((c) => q(r[c])).join(", ")})`).join(",\n");
  return `insert into public.${table} (${cols.join(", ")}) values\n${values}\non conflict (${conflict}) do nothing;\n\n`;
};

const vendors = seedVendors.map((v) => ({ ...v, logo_url: logos.has(v.slug) ? v.logo_url : "" }));
let sql = fs.readFileSync(path.resolve("supabase/schema.sql"), "utf8");
sql += "\n-- =====================================================================\n-- Seed data (skips rows that already exist)\n-- =====================================================================\n\n";
sql += insert("vendors", vendors, "slug");
sql += insert("pages", seedPages, "slug");
sql += insert("posts", seedPosts, "slug");
sql += `insert into public.settings (id, data) values (1, ${q(seedSettings)}) on conflict (id) do nothing;\n`;
fs.writeFileSync(path.resolve("supabase/setup.sql"), sql);
console.log(`supabase/setup.sql written: ${vendors.length} vendors, ${seedPages.length} pages, ${seedPosts.length} posts`);
