#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const findings = [];
const forbiddenPaths = ["netlify.toml", ".netlify", "netlify"];

for (const candidate of forbiddenPaths) {
  if (fs.existsSync(path.join(root, candidate))) {
    findings.push(`forbidden operational path: ${candidate}`);
  }
}

const excluded = new Set([
  "scripts/check-cloudflare-only.mjs",
  "README.md",
]);
const skippedDirectories = new Set([".git", "node_modules", "dist", ".wrangler"]);
const rootsToScan = ["package.json", "package-lock.json", "src", "scripts", ".github"];
const forbidden = [
  /@netlify\//i,
  /\bnetlify(?:-cli)?\s+(?:deploy|functions|build)\b/i,
  /\bapi\.netlify\.com\b/i,
  /\b[a-z0-9-]+\.netlify\.app\b/i,
  /\bNETLIFY_(?:AUTH_TOKEN|SITE_ID|TOKEN)\b/,
  /\bOPUS_NETLIFY_TOKEN\b/,
];

function scan(target) {
  if (!fs.existsSync(target)) return;
  const stat = fs.statSync(target);
  if (stat.isDirectory()) {
    if (skippedDirectories.has(path.basename(target))) return;
    for (const entry of fs.readdirSync(target)) scan(path.join(target, entry));
    return;
  }

  const relative = path.relative(root, target).split(path.sep).join("/");
  if (excluded.has(relative)) return;

  let text;
  try {
    text = fs.readFileSync(target, "utf8");
  } catch {
    return;
  }
  for (const pattern of forbidden) {
    if (pattern.test(text)) findings.push(`${relative}: matched ${pattern}`);
  }
}

for (const item of rootsToScan) scan(path.join(root, item));

if (findings.length) {
  console.error("Cloudflare-only platform policy failed:");
  for (const finding of findings) console.error(`- ${finding}`);
  process.exit(1);
}

console.log("Cloudflare-only platform policy: PASS");
console.log("Netlify operational capability: ABSENT");
