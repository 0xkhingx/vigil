#!/usr/bin/env node
// Vigil color audit.
// Flags any hex color outside the approved mono palette anywhere in the
// app (src/routes, src/components/vigil). Accent colors (#9ecbff,
// #b8e6c1, #f3e3a3) are SEMANTIC — they may only appear in
// src/components/vigil/VigilLayout.tsx, where TagChip + StatusBadge own
// the tag/state mapping. Anywhere else they're treated as decorative use
// and reported as a violation.

import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";

const ROOT = process.cwd();
const SCAN_DIRS = ["src/routes", "src/components/vigil"];
const ALLOW_ACCENT_IN = new Set([
  ["src", "components", "vigil", "VigilLayout.tsx"].join(sep),
]);

const MONO = new Set([
  "#0a0a0a",
  "#111",
  "#111111",
  "#1f1f1f",
  "#f0f0f0",
  "#888",
  "#888888",
  "#fff",
  "#ffffff",
  "#000",
  "#000000",
]);
const ACCENTS = new Set(["#9ecbff", "#b8e6c1", "#f3e3a3"]);

const HEX_RE = /#[0-9a-fA-F]{3,8}\b/g;

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    const s = statSync(p);
    if (s.isDirectory()) walk(p, out);
    else if (/\.(tsx?|css)$/.test(entry)) out.push(p);
  }
  return out;
}

const violations = [];
for (const base of SCAN_DIRS) {
  const abs = join(ROOT, base);
  let files;
  try {
    files = walk(abs);
  } catch {
    continue;
  }
  for (const file of files) {
    const rel = relative(ROOT, file);
    const allowAccent = ALLOW_ACCENT_IN.has(rel);
    const lines = readFileSync(file, "utf8").split("\n");
    lines.forEach((line, i) => {
      const matches = line.match(HEX_RE);
      if (!matches) return;
      for (const raw of matches) {
        const hex = raw.toLowerCase();
        if (MONO.has(hex)) continue;
        if (ACCENTS.has(hex)) {
          if (allowAccent) continue;
          violations.push({
            file: rel,
            line: i + 1,
            hex,
            reason: "accent used outside semantic owner (TagChip/StatusBadge)",
            source: line.trim(),
          });
          continue;
        }
        violations.push({
          file: rel,
          line: i + 1,
          hex,
          reason: "non-palette color",
          source: line.trim(),
        });
      }
    });
  }
}

if (violations.length === 0) {
  console.log("✓ color audit clean — only mono palette + semantic accents in use");
  process.exit(0);
}

console.error(`✗ color audit found ${violations.length} violation(s):\n`);
for (const v of violations) {
  console.error(`  ${v.file}:${v.line}  ${v.hex}  — ${v.reason}`);
  console.error(`    ${v.source}`);
}
console.error(
  "\nAccents (#9ecbff / #b8e6c1 / #f3e3a3) may only live in src/components/vigil/VigilLayout.tsx",
);
console.error("(TagChip + StatusBadge). Everything else must be mono.");
process.exit(1);
