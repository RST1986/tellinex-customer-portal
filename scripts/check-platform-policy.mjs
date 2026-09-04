#!/usr/bin/env node
/**
 * MyTellinex web hosting policy: Cloudflare Pages only.
 * This check rejects operational Netlify configuration, deployment commands,
 * dependencies, credentials and runtime endpoints from source and CI.
 */
import fs from "node:fs";
import path from "node:path";

const findings = [];
const forbiddenPaths = ["netlify.toml", ".netlify", "netlify"];
for (const candidate of forbiddenPaths) {
  if (fs.existsSync(candidate)) findings.push(`${candidate}: forbidden path exists`);
}

const skipDirectories = new Set([".git", "node_modules", "dist", ".wrangler"]);
const allowedFiles = new Set(["scripts/check-platform-policy.mjs"]);
const roots = [".github", "src", "scripts", "functions", "workers"];
const rootFiles = ["package.json", "package-lock.json", "vite.config.js", "wrangler.toml"];
const patterns = [
  [/@netlify\//i, "Netlify dependency or import"],
  [/\bnetlify\s+(?:deploy|build|dev|functions)\b|\bnetlify-cli\b|actions-netlify/i, "Netlify deploy command"],
  [/\bapi\.netlify\.com\b|[a-z0-9-]+\.netlify\.app\b|netlify\.com\/build_hooks/i, "Netlify runtime endpoint"],
  [/\b(?:OPUS_)?NETLIFY_(?:AUTH_TOKEN|TOKEN|SITE_ID)\b/i, "Netlify credential variable"]
];

function walk(target, output = []) {
  if (!fs.existsSync(target)) return output;
  const stat = fs.statSync(target);
  if (stat.isFile()) {
    output.push(target);
    return output;
  }
  for (const entry of fs.readdirSync(target, { withFileTypes: true })) {
    if (entry.isDirectory() && skipDirectories.has(entry.name)) continue;
    walk(path.join(target, entry.name), output);
  }
  return output;
}

const files = [
  ...roots.flatMap((root) => walk(root)),
  ...rootFiles.filter((file) => fs.existsSync(file))
];

for (const file of [...new Set(files)]) {
  const relative = file.split(path.sep).join("/");
  if (allowedFiles.has(relative)) continue;
  let text;
  try {
    text = fs.readFileSync(file, "utf8");
  } catch {
    continue;
  }
  for (const [pattern, category] of patterns) {
    if (pattern.test(text)) findings.push(`${relative}: ${category}`);
  }
}

if (findings.length > 0) {
  console.error("platform-policy: FAIL");
  for (const finding of findings) console.error(`  - ${finding}`);
  process.exit(1);
}

console.log("platform-policy: PASS");
console.log("WEB_RUNTIME=CLOUDFLARE_PAGES_ONLY");
console.log("NETLIFY_OPERATIONAL_CAPABILITY=FORBIDDEN");
